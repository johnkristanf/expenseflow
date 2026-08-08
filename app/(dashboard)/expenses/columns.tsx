"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { tableConfig } from "@/lib/table-features"

import { Expense } from "@/lib/api/expenses"
import { FormField, FormDialog } from "@/components/ui/form-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface GetColumnsOptions {
  fields: FormField[]
  onEdit: (id: number, data: Record<string, string>) => Promise<boolean>
  onDelete: (id: number) => void
}

export function getColumns({
  fields,
  onEdit,
  onDelete,
}: GetColumnsOptions): ColumnDef<typeof tableConfig, Expense>[] {
  return [
    {
      accessorKey: "dateSpent",
      header: "Date Spent",
      cell: ({ row }) => {
        const date = new Date(row.getValue("dateSpent"))
        return <div>{date.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      }
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }) => {
        const categoryName = row.original.category?.name || "Uncategorized"
        return <div>{categoryName}</div>
      }
    },
    {
      accessorKey: "budget.name",
      header: "Budget",
      cell: ({ row }) => {
        const budgetName = row.original.budget?.name || "No Budget"
        return <div>{budgetName}</div>
      }
    },
    {
      accessorKey: "spendingType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue<string>("spendingType")
        const isWants = type === "WANTS"
        return (
          <div className={`capitalize ${isWants ? "text-red-500 font-medium" : ""}`}>{type.replace("_", " ")}</div>
        )
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)

        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const expense = row.original

        const defaultValues: Record<string, string> = {
          description: expense.description ?? "",
          amount: expense.amount,
          dateSpent: expense.dateSpent,
          spendingType: expense.spendingType,
          categoryId: String(expense.categoryId ?? ""),
          budgetId: String(expense.budgetId ?? ""),
        }

        return (
          <Popover>
            <PopoverTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-40 p-1">
              <div className="flex flex-col gap-1">
                <FormDialog
                  title="Edit Expense"
                  description="Update the details of your expense."
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start px-2 py-1.5 h-auto text-sm"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  }
                  fields={fields}
                  defaultValues={defaultValues}
                  onSubmit={(data) => onEdit(expense.id, data)}
                  submitLabel="Save Changes"
                />
                <ConfirmDialog
                  title="Delete Expense"
                  description="This will permanently delete the expense and restore its amount to the linked budget."
                  confirmLabel="Delete"
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start px-2 py-1.5 h-auto text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  }
                  onConfirm={() => onDelete(expense.id)}
                />
              </div>
            </PopoverContent>
          </Popover>
        )
      },
    },
  ]
}
