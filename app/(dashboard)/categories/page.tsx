"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import { FormDialog } from "@/components/ui/form-dialog"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

import { categoriesApi } from "@/lib/api/categories"
import { CATEGORY_FORM_FIELDS } from "@/constants/categories"
import { toast } from "@/components/ui/toast"

export default function CategoriesPage() {
  const queryClient = useQueryClient()

  const { data = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
  })

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (formData: Record<string, string>) =>
      categoriesApi.create({ name: formData.name, notes: formData.notes || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.add({
        title: "Category created",
        description: "The category has been successfully added.",
        type: "success",
      })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to add category."
      toast.add({ title: "Error", description: message, type: "error" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: Record<string, string> }) =>
      categoriesApi.update(id, { name: formData.name, notes: formData.notes || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.add({
        title: "Category updated",
        description: "The category has been successfully updated.",
        type: "success",
      })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to update category."
      toast.add({ title: "Error", description: message, type: "error" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      // Invalidate expenses so any uncategorized display updates immediately
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      toast.add({
        title: "Category deleted",
        description: "The category has been removed.",
        type: "success",
      })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to delete category."
      toast.add({ title: "Error", description: message, type: "error" })
    },
  })

  // ── Handlers ──────────────────────────────────────────────────────────────

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
    () => getColumns({ fields: CATEGORY_FORM_FIELDS, onEdit: handleEdit, onDelete: handleDelete }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-end">
        <FormDialog
          title="Add New Category"
          description="Enter a name and optional notes for the new category."
          trigger={
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-4 w-4" />
              Add Category
            </Button>
          }
          fields={CATEGORY_FORM_FIELDS}
          onSubmit={handleSubmit}
          submitLabel="Add Category"
        />
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
