"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import { FormDialog } from "@/components/ui/form-dialog"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

import { incomeApi } from "@/lib/api/income"
import { INCOME_FORM_FIELDS } from "@/constants/income"
import { toast } from "@/components/ui/toast"

export default function IncomePage() {
  const queryClient = useQueryClient()

  const { data = [] } = useQuery({
    queryKey: ["income"],
    queryFn: incomeApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: (formData: Record<string, string>) =>
      incomeApi.create({
        source: formData.source,
        amount: parseFloat(formData.amount),
        dateAcquired: formData.dateAcquired,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] })
      toast.add({ title: "Income recorded", description: "Income has been added.", type: "success" })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to record income."
      toast.add({ title: "Error", description: message, type: "error" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: Record<string, string> }) =>
      incomeApi.update(id, {
        source: formData.source,
        amount: parseFloat(formData.amount),
        dateAcquired: formData.dateAcquired,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] })
      toast.add({ title: "Income updated", description: "Income has been updated.", type: "success" })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to update income."
      toast.add({ title: "Error", description: message, type: "error" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => incomeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] })
      toast.add({ title: "Income deleted", description: "Income has been removed.", type: "success" })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to delete income."
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
    () => getColumns({ fields: INCOME_FORM_FIELDS, onEdit: handleEdit, onDelete: handleDelete }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-end">
        <FormDialog
          title="Add Income"
          description="Enter the details of your income."
          trigger={
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-4 w-4" />
              Add Income
            </Button>
          }
          fields={INCOME_FORM_FIELDS}
          onSubmit={handleSubmit}
          submitLabel="Add Income"
        />
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
