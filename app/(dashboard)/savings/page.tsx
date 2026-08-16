"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PlusIcon, Target } from "lucide-react"

import { savingsApi, type Saving } from "@/lib/api/savings"
import { accountsApi } from "@/lib/api/accounts"
import { FormDialog } from "@/components/ui/form-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { GoalCard } from "@/components/ui/goal-card"
import { SAVINGS_FORM_FIELDS } from "@/constants/savings"
import type { AdjustData } from "@/components/ui/adjust-dialog"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function SavingsPage() {
  const queryClient = useQueryClient()

  const { data: savings = [], isLoading } = useQuery({
    queryKey: ["savings"],
    queryFn: savingsApi.getAll,
  })

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountsApi.getAll,
  })

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (formData: Record<string, string>) =>
      savingsApi.create({
        goalName: formData.goalName,
        targetAmount: parseFloat(formData.targetAmount),
        startDate: formData.startDate,
        targetDate: formData.targetDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] })
      toast.add({ title: "Savings goal created", description: "Savings goal has been added.", type: "success" })
    },
    onError: (err: unknown) => {
      toast.add({ title: "Error", description: err instanceof Error ? err.message : "Failed to create savings goal.", type: "error" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: Record<string, string> }) =>
      savingsApi.update(id, {
        goalName: formData.goalName,
        targetAmount: parseFloat(formData.targetAmount),
        startDate: formData.startDate,
        targetDate: formData.targetDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] })
      toast.add({ title: "Savings goal updated", description: "Savings goal has been updated.", type: "success" })
    },
    onError: (err: unknown) => {
      toast.add({ title: "Error", description: err instanceof Error ? err.message : "Failed to update savings goal.", type: "error" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => savingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] })
      toast.add({ title: "Savings goal deleted", description: "Savings goal has been removed.", type: "success" })
    },
    onError: (err: unknown) => {
      toast.add({ title: "Error", description: err instanceof Error ? err.message : "Failed to delete savings goal.", type: "error" })
    },
  })

  const adjustMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdjustData }) => savingsApi.adjust(id, data),
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ["savings"] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      const label = data.type === "increment" ? "added to" : "withdrawn from"
      toast.add({ title: "Savings adjusted", description: `Funds ${label} the goal.`, type: "success" })
    },
    onError: (err: unknown) => {
      toast.add({ title: "Error", description: err instanceof Error ? err.message : "Failed to adjust savings goal.", type: "error" })
    },
  })

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleCreate(formData: Record<string, string>): Promise<boolean> {
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

  function handleAdjust(id: number, data: AdjustData) {
    adjustMutation.mutate({ id, data })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-end">
        <FormDialog
          title="Add Savings Goal"
          description="Enter the details of your savings goal."
          trigger={
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-4 w-4" />
              Add Savings Goal
            </Button>
          }
          fields={SAVINGS_FORM_FIELDS}
          onSubmit={handleCreate}
          submitLabel="Add Savings Goal"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : savings.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No savings goals yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first savings goal to start tracking your progress.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {(savings as Saving[]).map((saving) => (
            <GoalCard
              key={saving.id}
              id={saving.id}
              name={saving.goalName}
              subtitle={`${formatDate(saving.startDate)} → ${formatDate(saving.targetDate)}`}
              icon={<Target className="h-4.5 w-4.5" />}
              currentAmount={saving.currentAmount}
              totalAmount={saving.targetAmount}
              progressLabel="Saved"
              progressSuffix="saved"
              formFields={SAVINGS_FORM_FIELDS}
              editDefaultValues={{
                goalName: saving.goalName,
                targetAmount: saving.targetAmount,
                startDate: saving.startDate,
                targetDate: saving.targetDate,
              }}
              editTitle={`Edit — ${saving.goalName}`}
              editDescription="Update your savings goal details."
              adjustDescription="Add funds from an account or withdraw from this savings goal."
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
