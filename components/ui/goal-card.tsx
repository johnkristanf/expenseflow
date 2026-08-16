"use client"

import * as React from "react"
import { Pencil } from "lucide-react"

import { FormDialog, type FormField } from "@/components/ui/form-dialog"
import { AdjustDialog, type AdjustData } from "@/components/ui/adjust-dialog"
import { DeleteDialog } from "@/components/ui/delete-dialog"
import { formatCurrency } from "@/lib/utils/format-currency"
import { getProgress, getProgressColor } from "@/lib/utils/budget-utils"

export interface GoalCardProps {
  id: number
  name: string
  /** Optional subtitle rendered below the name (e.g. date range for savings). */
  subtitle?: string
  /** Icon rendered in the coloured badge on the left. */
  icon: React.ReactNode
  currentAmount: string
  totalAmount: string
  /** Label above the progress bar. Defaults to "Current". */
  progressLabel?: string
  /** Suffix in the bottom-left progress caption. Defaults to "used". */
  progressSuffix?: string
  formFields: FormField[]
  editDefaultValues: Record<string, string>
  editTitle: string
  editDescription?: string
  adjustDescription?: string
  accounts: { id: number; name: string }[]
  onEdit: (id: number, data: Record<string, string>) => Promise<boolean>
  onDelete: (id: number) => void
  onAdjust: (id: number, data: AdjustData) => void
  deletePending: boolean
  adjustPending: boolean
}

export function GoalCard({
  id,
  name,
  subtitle,
  icon,
  currentAmount,
  totalAmount,
  progressLabel = "Current",
  progressSuffix = "used",
  formFields,
  editDefaultValues,
  editTitle,
  editDescription = "Update the details.",
  adjustDescription,
  accounts,
  onEdit,
  onDelete,
  onAdjust,
  deletePending,
  adjustPending,
}: GoalCardProps) {
  const pct = getProgress(currentAmount, totalAmount)
  const colorClass = getProgressColor(pct)

  return (
    <div className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground leading-tight">{name}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5">
          <FormDialog
            title={editTitle}
            description={editDescription}
            trigger={
              <button
                id={`edit-goal-${id}`}
                title="Edit"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-amber-500/15 hover:text-amber-400"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            }
            fields={formFields}
            defaultValues={editDefaultValues}
            submitLabel="Save Changes"
            onSubmit={(data) => onEdit(id, data)}
          />

          <AdjustDialog
            triggerId={`adjust-goal-${id}`}
            name={name}
            description={adjustDescription}
            accounts={accounts}
            onConfirm={(data) => onAdjust(id, data)}
            loading={adjustPending}
          />

          <DeleteDialog
            triggerId={`delete-goal-${id}`}
            name={name}
            title="Delete"
            onConfirm={() => onDelete(id)}
            loading={deletePending}
          />
        </div>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{progressLabel}</span>
          <span className="font-semibold tabular-nums text-foreground">
            {formatCurrency(currentAmount)}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full bg-linear-to-r transition-all duration-500 ${colorClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{pct.toFixed(0)}% {progressSuffix}</span>
          <span>of {formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  )
}
