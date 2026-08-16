"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import { FormDialog } from "@/components/ui/form-dialog"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

import { expensesApi } from "@/lib/api/expenses"
import { budgetsApi, type Budget } from "@/lib/api/budgets"
import { categoriesApi } from "@/lib/api/categories"
import { getExpenseFormFields } from "@/constants/expenses"
import { ExpenseFilter, ActiveFilter } from "@/components/expenses/expense-filter"
import { BudgetLookupPopover } from "@/components/expenses/budget-lookup-popover"
import { toast } from "@/components/ui/toast"

export default function ExpensesPage() {
  const queryClient = useQueryClient()
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
  })

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: async (): Promise<Budget[]> => budgetsApi.getAll(),
  })

  const { data: topBudgets = [] } = useQuery({
    queryKey: ["budgets", "lookup"],
    queryFn: async (): Promise<Budget[]> => budgetsApi.getAll("lookup"),
  })

  const { data = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: expensesApi.getAll,
  })

  const fields = getExpenseFormFields(categories, budgets)

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filteredData = React.useMemo(() => {
    if (activeFilters.length === 0) return data

    return data.filter((row) => {
      return activeFilters.every((filter) => {
        if (filter.type === "dateRange") {
          const { from, to } = JSON.parse(filter.value) as { from?: string; to?: string }
          if (from && row.dateSpent < from) return false
          if (to   && row.dateSpent > to)   return false
          return true
        }

        if (filter.type === "amount") {
          const { min, max } = JSON.parse(filter.value) as { min?: string; max?: string }
          const amount = parseFloat(row.amount)
          if (min && amount < parseFloat(min)) return false
          if (max && amount > parseFloat(max)) return false
          return true
        }

        if (filter.type === "spendingType") {
          return row.spendingType === filter.value
        }
        if (filter.type === "category") {
          return String(row.categoryId) === filter.value
        }
        if (filter.type === "budget") {
          return String(row.budgetId) === filter.value
        }

        return true
      })
    })
  }, [data, activeFilters])

  const createMutation = useMutation({
    mutationFn: (formData: Record<string, string>) => expensesApi.create({
      description: formData.description,
      amount: parseFloat(formData.amount),
      dateSpent: formData.dateSpent,
      spendingType: formData.spendingType,
      categoryId: parseInt(formData.categoryId, 10),
      budgetId: parseInt(formData.budgetId, 10),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      toast.add({
        title: "Expense created",
        description: "The expense has been successfully added.",
        type: "success",
      })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to add expense."
      toast.add({ title: "Error", description: message, type: "error" })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number, formData: Record<string, string> }) => expensesApi.update(id, {
      description: formData.description,
      amount: parseFloat(formData.amount),
      dateSpent: formData.dateSpent,
      spendingType: formData.spendingType,
      categoryId: parseInt(formData.categoryId, 10),
      budgetId: parseInt(formData.budgetId, 10),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      toast.add({
        title: "Expense updated",
        description: "The expense has been successfully updated.",
        type: "success",
      })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to update expense."
      toast.add({ title: "Error", description: message, type: "error" })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      toast.add({
        title: "Expense deleted",
        description: "The expense has been successfully deleted.",
        type: "success",
      })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to delete expense."
      toast.add({ title: "Error", description: message, type: "error" })
    }
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
    () => getColumns({ fields, onEdit: handleEdit, onDelete: handleDelete }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields]
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-end gap-3">

        <div className="flex items-center gap-2">
          <ExpenseFilter
            categories={categories}
            budgets={budgets}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
          />
          <BudgetLookupPopover budgets={topBudgets} />
          <FormDialog
            title="Add New Expense"
            description="Enter the details of your expense."
            trigger={
              <Button size="sm" className="gap-1.5">
                <PlusIcon className="h-4 w-4" />
                Add Expense
              </Button>
            }
            fields={fields}
            onSubmit={handleSubmit}
            submitLabel="Add Expense"
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} />
    </div>
  )
}
