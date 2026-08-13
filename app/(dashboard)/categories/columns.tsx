"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { tableConfig } from "@/lib/table-features"

import { Category } from "@/lib/api/categories"
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
}: GetColumnsOptions): ColumnDef<typeof tableConfig, Category>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.getValue<string | null>("notes")
        return <div className="text-muted-foreground">{notes ?? "—"}</div>
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const raw = row.getValue<string>("createdAt")
        const date = new Date(raw)
        return (
          <div>
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original

        const defaultValues: Record<string, string> = {
          name: category.name,
          notes: category.notes ?? "",
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
                  title="Edit Category"
                  description="Update the name or notes for this category."
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
                  onSubmit={(data) => onEdit(category.id, data)}
                  submitLabel="Save Changes"
                />
                <ConfirmDialog
                  title="Delete Category"
                  description="This will permanently delete the category. Expenses linked to it will become uncategorized."
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
                  onConfirm={() => onDelete(category.id)}
                />
              </div>
            </PopoverContent>
          </Popover>
        )
      },
    },
  ]
}
