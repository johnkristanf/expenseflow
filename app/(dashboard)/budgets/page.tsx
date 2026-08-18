"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PlusIcon, PiggyBank } from "lucide-react"

import { budgetsApi, type Budget } from "@/lib/api/budgets"
import { accountsApi } from "@/lib/api/accounts"
import { FormDialog } from "@/components/ui/form-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { GoalCard } from "@/components/ui/goal-card"
import { BUDGET_FORM_FIELDS } from "@/constants/budgets"
import type { AdjustData } from "@/components/ui/adjust-dialog"

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
    mutationFn: (data: { name: string; totalAmount: number }) => budgetsApi.create(data),
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
    mutationFn: ({ id, data }: { id: number; data: AdjustData }) => budgetsApi.adjust(id, data),
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

  const moveMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdjustData }) =>
      budgetsApi.move(id, { targetBudgetId: data.targetBudgetId!, amount: data.amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      toast.add({ title: "Funds moved", description: "Balance transferred to the target budget.", type: "success" })
    },
    onError: (err: unknown) => {
      toast.add({ title: "Error", description: err instanceof Error ? err.message : "Failed to move funds.", type: "error" })
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
    await updateMutation.mutateAsync({ id, data: { name: formData.name, totalAmount: parseFloat(formData.totalAmount) } })
    return true
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id)
  }

  function handleAdjust(id: number, data: AdjustData) {
    if (data.type === "move") {
      moveMutation.mutate({ id, data })
    } else {
      adjustMutation.mutate({ id, data })
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col gap-6">
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
          fields={BUDGET_FORM_FIELDS}
          submitLabel="Create Budget"
          onSubmit={handleCreate}
        />
      </div>

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
            <GoalCard
              key={budget.id}
              id={budget.id}
              name={budget.name}
              icon={<PiggyBank className="h-4.5 w-4.5" />}
              currentAmount={budget.currentAmount}
              totalAmount={budget.totalAmount}
              progressLabel="Available"
              progressSuffix="remaining"
              formFields={BUDGET_FORM_FIELDS}
              editDefaultValues={{ name: budget.name, totalAmount: budget.totalAmount }}
              editTitle={`Edit — ${budget.name}`}
              editDescription="Update your budget details."
              adjustDescription="Add funds from an account or deduct from the budget balance."
              accounts={accounts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdjust={handleAdjust}
              deletePending={deleteMutation.isPending}
              adjustPending={adjustMutation.isPending || moveMutation.isPending}
              budgets={budgets}
            />
          ))}
        </div>
      )}
    </div>
  )
}
