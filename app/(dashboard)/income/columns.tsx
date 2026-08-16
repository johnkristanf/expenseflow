"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { tableConfig } from "@/lib/table-features"

import { Income } from "@/lib/api/income"
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
}: GetColumnsOptions): ColumnDef<typeof tableConfig, Income>[] {
  return [
    {
      accessorKey: "dateAcquired",
      header: "Date Acquired",
      cell: ({ row }) => {
        const date = new Date(row.getValue<string>("dateAcquired"))
        return (
          <div>
            {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        )
      },
    },
    {
      accessorKey: "source",
      header: "Source",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue<string>("amount"))
        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount)
        return <div className="font-medium text-green-500">{formatted}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const record = row.original

        const defaultValues: Record<string, string> = {
          source: record.source,
          amount: record.amount,
          dateAcquired: record.dateAcquired,
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
                  title="Edit Income"
                  description="Update the details of this income record."
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
                  onSubmit={(data) => onEdit(record.id, data)}
                  submitLabel="Save Changes"
                />
                <ConfirmDialog
                  title="Delete Income Record"
                  description="This will permanently delete this income entry."
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
                  onConfirm={() => onDelete(record.id)}
                />
              </div>
            </PopoverContent>
          </Popover>
        )
      },
    },
  ]
}
