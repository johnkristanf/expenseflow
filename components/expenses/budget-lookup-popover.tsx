"use client"

import * as React from "react"
import { Wallet } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Budget } from "@/lib/api/budgets"
import { formatCurrency } from "@/lib/utils/format-currency"
import { getProgress, getProgressColor } from "@/lib/utils/budget-utils"

function BudgetRow({ budget }: { budget: Budget }) {
  const pct = getProgress(budget.currentAmount, budget.totalAmount)
  const colorClass = getProgressColor(pct)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-4">
        <span className="truncate text-sm font-medium text-foreground">{budget.name}</span>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
          {formatCurrency(budget.currentAmount)}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full bg-linear-to-r transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{pct.toFixed(0)}% remaining</span>
        <span>of {formatCurrency(budget.totalAmount)}</span>
      </div>
    </div>
  )
}

export function BudgetLookupPopover({ budgets }: { budgets: Budget[] }) {
  // Use the pre-sorted budgets passed from the server
  const top5 = budgets

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            id="budget-lookup-trigger"
            title="Quick budget lookup"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-foreground"
          />
        }
      >
        <Wallet className="h-4 w-4" />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Budget Overview</p>
          <p className="text-xs text-muted-foreground mt-0.5">Latest 5 budgets with remaining funds</p>
        </div>

        <div className="flex flex-col gap-4 p-4">
          {top5.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-2">
              No budgets with remaining funds.
            </p>
          ) : (
            top5.map((budget) => <BudgetRow key={budget.id} budget={budget} />)
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
