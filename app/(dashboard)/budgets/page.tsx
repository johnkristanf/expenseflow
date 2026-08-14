"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Pencil,
  Trash2,
  ArrowUpDown,
  PlusIcon,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react"

import { budgetsApi, type Budget } from "@/lib/api/budgets"
import { accountsApi } from "@/lib/api/accounts"
import { FormDialog, type FormField } from "@/components/ui/form-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

interface BudgetCardView {
  id: number
  name: string
  currentAmount: string
  totalAmount: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(val: string) {
  const num = parseFloat(val)
  return isNaN(num)
    ? "₱0.00"
    : new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }).format(num)
}

function getProgress(current: string, total: string) {
  const c = parseFloat(current)
  const t = parseFloat(total)
  if (!t) return 0
  return Math.min(100, Math.max(0, (c / t) * 100))
}

function getProgressColor(pct: number) {
  if (pct >= 75) return "from-emerald-500 to-emerald-400"
  if (pct >= 40) return "from-amber-500 to-amber-400"
  return "from-rose-500 to-rose-400"
}

// ─── Create / Edit fields ─────────────────────────────────────────────────────

const budgetBaseFields: FormField[] = [
  {
    name: "name",
    label: "Budget Name",
    type: "text",
    placeholder: "e.g. Groceries",
    required: true,
  },
  {
    name: "totalAmount",
    label: "Total Amount",
    type: "number",
    placeholder: "0.00",
    required: true,
  },
]

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteBudgetDialog({
  budget,
  onConfirm,
  loading,
}: {
  budget: BudgetCardView
  onConfirm: () => void
  loading: boolean
}) {
  const [open, setOpen] = React.useState(false)

  function handleConfirm() {
    onConfirm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            id={`delete-budget-${budget.id}`}
            title="Delete budget"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-rose-500/15 hover:text-rose-400"
          />
        }
      >
        <Trash2 className="h-3.5 w-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Budget</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{budget.name}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={loading} />}>
            Cancel
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Adjust Dialog ────────────────────────────────────────────────────────────

function AdjustBudgetDialog({
  budget,
  accounts,
  onConfirm,
  loading,
}: {
  budget: BudgetCardView
  accounts: { id: number; name: string }[]
  onConfirm: (data: {
    amount: number
    type: "increment" | "decrement"
    accountId?: number
    reason?: string
  }) => void
  loading: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState<"increment" | "decrement">("increment")
  const [amount, setAmount] = React.useState("")
  const [accountId, setAccountId] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [err, setErr] = React.useState("")

  function reset() {
    setType("increment")
    setAmount("")
    setAccountId("")
    setReason("")
    setErr("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amount || isNaN(amt) || amt <= 0) {
      setErr("Enter a valid positive amount.")
      return
    }
    if (type === "increment" && !accountId) {
      setErr("Select an account to transfer from.")
      return
    }
    setErr("")
    onConfirm({
      amount: amt,
      type,
      accountId: type === "increment" ? parseInt(accountId, 10) : undefined,
      reason: type === "decrement" ? reason || undefined : undefined,
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger
        render={
          <button
            id={`adjust-budget-${budget.id}`}
            title="Adjust budget"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-blue-500/15 hover:text-blue-400"
          />
        }
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust — {budget.name}</DialogTitle>
          <DialogDescription>
            Add funds from an account or deduct from the budget balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-4 py-2">
            {/* Type toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("increment")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  type === "increment"
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                    : "border-border text-muted-foreground hover:border-emerald-500/30"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Increment
              </button>
              <button
                type="button"
                onClick={() => setType("decrement")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  type === "decrement"
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-400"
                    : "border-border text-muted-foreground hover:border-rose-500/30"
                }`}
              >
                <TrendingDown className="h-4 w-4" />
                Decrement
              </button>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="adj-amount" className="text-sm font-medium">
                Amount <span className="text-destructive">*</span>
              </label>
              <input
                id="adj-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>

            {/* Account (increment only) */}
            {type === "increment" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="adj-account" className="text-sm font-medium">
                  From Account <span className="text-destructive">*</span>
                </label>
                <select
                  id="adj-account"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="" disabled>
                    Select account…
                  </option>
                  {accounts.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reason (decrement only) */}
            {type === "decrement" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="adj-reason" className="text-sm font-medium">
                  Reason <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <input
                  id="adj-reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Emergency withdrawal"
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
            )}

            {err && <p className="text-xs text-destructive">{err}</p>}
          </div>

          <DialogFooter className="mt-4" showCloseButton={false}>
            <DialogClose render={<Button type="button" variant="outline" disabled={loading} />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Apply"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Budget Card ──────────────────────────────────────────────────────────────

function BudgetCard({
  budget,
  accounts,
  onEdit,
  onDelete,
  onAdjust,
  deletePending,
  adjustPending,
}: {
  budget: BudgetCardView
  accounts: { id: number; name: string }[]
  onEdit: (id: number, data: Record<string, string>) => Promise<boolean>
  onDelete: (id: number) => void
  onAdjust: (
    id: number,
    data: { amount: number; type: "increment" | "decrement"; accountId?: number; reason?: string }
  ) => void
  deletePending: boolean
  adjustPending: boolean
}) {
  const pct = getProgress(budget.currentAmount, budget.totalAmount)
  const colorClass = getProgressColor(pct)

  const editDefaultValues: Record<string, string> = {
    name: budget.name,
    totalAmount: budget.totalAmount,
  }

  return (
    <div className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PiggyBank className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground leading-tight">{budget.name}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5">
          <FormDialog
            title={`Edit — ${budget.name}`}
            description="Update your budget details."
            trigger={
              <button
                id={`edit-budget-${budget.id}`}
                title="Edit budget"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-amber-500/15 hover:text-amber-400"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            }
            fields={budgetBaseFields}
            defaultValues={editDefaultValues}
            submitLabel="Save Changes"
            onSubmit={(data) => onEdit(budget.id, data)}
          />

          <AdjustBudgetDialog
            budget={budget}
            accounts={accounts}
            onConfirm={(data) => onAdjust(budget.id, data)}
            loading={adjustPending}
          />

          <DeleteBudgetDialog
            budget={budget}
            onConfirm={() => onDelete(budget.id)}
            loading={deletePending}
          />
        </div>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Available</span>
          <span className="font-semibold tabular-nums text-foreground">
            {formatCurrency(budget.currentAmount)}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${colorClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{pct.toFixed(0)}% remaining</span>
          <span>of {formatCurrency(budget.totalAmount)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BudgetsPage() {
  const queryClient = useQueryClient()

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets", "card"],
    queryFn: async (): Promise<Budget[]> => budgetsApi.getAll("card"),
  })

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountsApi.getAll,
  })

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (data: { name: string; totalAmount: number }) =>
      budgetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      toast.add({ title: "Budget created", description: "New budget added successfully.", type: "success" })
    },
    onError: (err: unknown) => {
      toast.add({ title: "Error", description: err instanceof Error ? err.message : "Failed to create budget.", type: "error" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; totalAmount: number } }) =>
      budgetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      toast.add({ title: "Budget updated", description: "Changes saved successfully.", type: "success" })
    },
    onError: (err: unknown) => {
      toast.add({ title: "Error", description: err instanceof Error ? err.message : "Failed to update budget.", type: "error" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => budgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      toast.add({ title: "Budget deleted", description: "The budget has been removed.", type: "success" })
    },
    onError: (err: unknown) => {
      toast.add({ title: "Error", description: err instanceof Error ? err.message : "Failed to delete budget.", type: "error" })
    },
  })

  const adjustMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: { amount: number; type: "increment" | "decrement"; accountId?: number; reason?: string }
    }) => budgetsApi.adjust(id, data),
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      const label = data.type === "increment" ? "added to" : "deducted from"
      toast.add({ title: "Budget adjusted", description: `Funds ${label} the budget.`, type: "success" })
    },
    onError: (err: unknown) => {
      toast.add({ title: "Error", description: err instanceof Error ? err.message : "Failed to adjust budget.", type: "error" })
    },
  })

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleCreate(formData: Record<string, string>): Promise<boolean> {
    await createMutation.mutateAsync({
      name: formData.name,
      totalAmount: parseFloat(formData.totalAmount),
    })
    return true
  }

  async function handleEdit(id: number, formData: Record<string, string>): Promise<boolean> {
    await updateMutation.mutateAsync({
      id,
      data: {
        name: formData.name,
        totalAmount: parseFloat(formData.totalAmount),
      },
    })
    return true
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id)
  }

  function handleAdjust(
    id: number,
    data: { amount: number; type: "increment" | "decrement"; accountId?: number; reason?: string }
  ) {
    adjustMutation.mutate({ id, data })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Toolbar */}
      <div className="flex items-center justify-end">
        <FormDialog
          title="Create Budget"
          description="Set up a new budget to track your spending."
          trigger={
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-4 w-4" />
              New Budget
            </Button>
          }
          fields={budgetBaseFields}
          submitLabel="Create Budget"
          onSubmit={handleCreate}
        />
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PiggyBank className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No budgets yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first budget to start tracking your spending.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {(budgets as Budget[]).map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              accounts={accounts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdjust={handleAdjust}
              deletePending={deleteMutation.isPending}
              adjustPending={adjustMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}
