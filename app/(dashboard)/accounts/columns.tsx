"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { tableConfig } from "@/lib/table-features"

import { Account } from "@/lib/api/accounts"
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
}: GetColumnsOptions): ColumnDef<typeof tableConfig, Account>[] {
  return [
    {
      accessorKey: "name",
      header: "Account Name",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue<string>("type")
        return <div className="capitalize">{type.replace("_", " ")}</div>
      },
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => {
        const balance = parseFloat(row.getValue<string>("balance"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(balance)
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const account = row.original

        const defaultValues: Record<string, string> = {
          name: account.name,
          type: account.type,
          balance: account.balance,
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
                  title="Edit Account"
                  description="Update the details of this account."
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
                  onSubmit={(data) => onEdit(account.id, data)}
                  submitLabel="Save Changes"
                />
                <ConfirmDialog
                  title="Delete Account"
                  description="This will permanently delete the account and all its data."
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
                  onConfirm={() => onDelete(account.id)}
                />
              </div>
            </PopoverContent>
          </Popover>
        )
      },
    },
  ]
}
