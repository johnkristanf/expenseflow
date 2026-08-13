"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { FormDialog } from "@/components/ui/form-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { PlusIcon, Pencil, Trash2, Landmark, Wallet, CreditCard, PieChart, Coins } from "lucide-react"

import { accountsApi, type Account } from "@/lib/api/accounts"
import { ACCOUNT_FORM_FIELDS } from "@/constants/accounts"
import { toast } from "@/components/ui/toast"

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

function getAccountIcon(type: string) {
  switch (type) {
    case 'cash':
      return <Coins className="h-4.5 w-4.5" />
    case 'credit_card':
      return <CreditCard className="h-4.5 w-4.5" />
    case 'investment':
      return <PieChart className="h-4.5 w-4.5" />
    case 'savings':
      return <Landmark className="h-4.5 w-4.5" />
    default:
      return <Wallet className="h-4.5 w-4.5" />
  }
}

function AccountCard({
  account,
  onEdit,
  onDelete,
  deletePending,
}: {
  account: Account
  onEdit: (id: number, data: Record<string, string>) => Promise<boolean>
  onDelete: (id: number) => void
  deletePending: boolean
}) {
  const editDefaultValues: Record<string, string> = {
    name: account.name,
    type: account.type,
    balance: account.balance,
  }

  return (
    <div className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {getAccountIcon(account.type)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground leading-tight">{account.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{account.type.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-100">
          <FormDialog
            title={`Edit — ${account.name}`}
            description="Update your account details."
            trigger={
              <button
                title="Edit account"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-amber-500/15 hover:text-amber-400"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            }
            fields={ACCOUNT_FORM_FIELDS}
            defaultValues={editDefaultValues}
            submitLabel="Save Changes"
            onSubmit={(data) => onEdit(account.id, data)}
          />

          <ConfirmDialog
            title="Delete Account"
            description={
              <>
                Are you sure you want to delete <span className="font-semibold text-foreground">{account.name}</span>? This action cannot be undone.
              </>
            }
            confirmLabel="Delete"
            trigger={
              <button
                title="Delete account"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-rose-500/15 hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            }
            onConfirm={() => onDelete(account.id)}
          />
        </div>
      </div>

      {/* Balance */}
      <div className="mt-2 flex flex-col gap-1">
        <div className="text-sm text-muted-foreground">Current Balance</div>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {formatCurrency(account.balance)}
        </div>
      </div>
    </div>
  )
}

export default function AccountsPage() {
  const queryClient = useQueryClient()

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountsApi.getAll,
  })

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (formData: Record<string, string>) =>
      accountsApi.create({
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      toast.add({ title: "Account created", description: "Account has been added.", type: "success" })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to add account."
      toast.add({ title: "Error", description: message, type: "error" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: Record<string, string> }) =>
      accountsApi.update(id, {
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      toast.add({ title: "Account updated", description: "Account has been updated.", type: "success" })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to update account."
      toast.add({ title: "Error", description: message, type: "error" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => accountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      toast.add({ title: "Account deleted", description: "Account has been removed.", type: "success" })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to delete account."
      toast.add({ title: "Error", description: message, type: "error" })
    },
  })

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleSubmit(formData: Record<string, string>): Promise<boolean> {
    await createMutation.mutateAsync(formData)
    return true
  }

  async function handleEdit(id: number, formData: Record<string, string>): Promise<boolean> {
    await updateMutation.mutateAsync({ id, formData })
    return true
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-end">
        <FormDialog
          title="Add New Account"
          description="Enter the details of your account."
          trigger={
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-4 w-4" />
              Add Account
            </Button>
          }
          fields={ACCOUNT_FORM_FIELDS}
          onSubmit={handleSubmit}
          submitLabel="Add Account"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No accounts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first account to start tracking your balances.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {(accounts as Account[]).map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deletePending={deleteMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}
