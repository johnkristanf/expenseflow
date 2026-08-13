"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import { FormDialog } from "@/components/ui/form-dialog"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

import { savingsApi } from "@/lib/api/savings"
import { SAVINGS_FORM_FIELDS } from "@/constants/savings"
import { toast } from "@/components/ui/toast"

export default function SavingsPage() {
  const queryClient = useQueryClient()

  const { data = [] } = useQuery({
    queryKey: ["savings"],
    queryFn: savingsApi.getAll,
  })

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
      const message = err instanceof Error ? err.message : "Failed to create savings goal."
      toast.add({ title: "Error", description: message, type: "error" })
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
      const message = err instanceof Error ? err.message : "Failed to update savings goal."
      toast.add({ title: "Error", description: message, type: "error" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => savingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] })
      toast.add({ title: "Savings goal deleted", description: "Savings goal has been removed.", type: "success" })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to delete savings goal."
      toast.add({ title: "Error", description: message, type: "error" })
    },
  })

  async function handleSubmit(formData: Record<string, string>): Promise<boolean> {
    await createMutation.mutateAsync(formData)
    return true
  }

  async function handleEdit(id: number, formData: Record<string, string>): Promise<boolean> {
    await updateMutation.mutateAsync({ id, formData })
    return true
  }

  async function handleDelete(id: number) {
    await deleteMutation.mutateAsync(id)
  }

  const columns = React.useMemo(
    () => getColumns({ fields: SAVINGS_FORM_FIELDS, onEdit: handleEdit, onDelete: handleDelete }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
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
          onSubmit={handleSubmit}
          submitLabel="Add Savings Goal"
        />
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
