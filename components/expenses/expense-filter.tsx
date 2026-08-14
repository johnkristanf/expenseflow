"use client"

import * as React from "react"
import {
  SlidersHorizontal,
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Tag,
  Wallet,
  LayoutList,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SPENDING_TYPES } from "@/constants/expenses"
import type { Category } from "@/lib/api/categories"
import type { Budget } from "@/lib/api/budgets"

// ─── Types ────────────────────────────────────────────────────────────────────

export type FilterType =
  | "spendingType"
  | "category"
  | "budget"
  | "dateRange"
  | "amount"

export interface ActiveFilter {
  type: FilterType
  label: string
  value: string
  displayValue: string
}

interface ExpenseFilterProps {
  categories: Category[]
  budgets: Budget[]
  activeFilters: ActiveFilter[]
  onFiltersChange: (filters: ActiveFilter[]) => void
}

// ─── Filter type metadata ─────────────────────────────────────────────────────

const FILTER_TYPES: { type: FilterType; label: string; icon: React.ElementType }[] = [
  { type: "spendingType", label: "Spending Type", icon: LayoutList },
  { type: "category", label: "Category", icon: Tag },
  { type: "budget", label: "Budget", icon: Wallet },
  { type: "dateRange", label: "Date Range", icon: Calendar },
  { type: "amount", label: "Amount", icon: DollarSign },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function ExpenseFilter({
  categories,
  budgets,
  activeFilters,
  onFiltersChange,
}: ExpenseFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<FilterType | null>(null)

  // Local state for the active filter panel inputs
  const [tempValue, setTempValue] = React.useState("")
  const [tempDateFrom, setTempDateFrom] = React.useState("")
  const [tempDateTo, setTempDateTo] = React.useState("")
  const [tempAmtMin, setTempAmtMin] = React.useState("")
  const [tempAmtMax, setTempAmtMax] = React.useState("")

  function resetPanel() {
    setSelectedType(null)
    setTempValue("")
    setTempDateFrom("")
    setTempDateTo("")
    setTempAmtMin("")
    setTempAmtMax("")
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) resetPanel()
  }

  function addFilter(filter: ActiveFilter) {
    // Replace any existing filter of the same type
    const updated = [
      ...activeFilters.filter((f) => f.type !== filter.type),
      filter,
    ]
    onFiltersChange(updated)
    handleOpenChange(false)
  }

  function removeFilter(type: FilterType) {
    onFiltersChange(activeFilters.filter((f) => f.type !== type))
  }

  function applySimpleFilter(type: FilterType, value: string) {
    if (!value) return
    const typeLabel = FILTER_TYPES.find((f) => f.type === type)?.label ?? type

    let displayValue = value
    if (type === "spendingType") displayValue = value
    if (type === "category")
      displayValue = categories.find((c) => String(c.id) === value)?.name ?? value
    if (type === "budget")
      displayValue = budgets.find((b) => String(b.id) === value)?.name ?? value

    addFilter({ type, label: typeLabel, value, displayValue })
  }

  function applyDateRange() {
    if (!tempDateFrom && !tempDateTo) return
    const display =
      tempDateFrom && tempDateTo
        ? `${tempDateFrom} → ${tempDateTo}`
        : tempDateFrom
          ? `From ${tempDateFrom}`
          : `Until ${tempDateTo}`
    addFilter({
      type: "dateRange",
      label: "Date Range",
      value: JSON.stringify({ from: tempDateFrom, to: tempDateTo }),
      displayValue: display,
    })
  }

  function applyAmountRange() {
    if (!tempAmtMin && !tempAmtMax) return
    const display =
      tempAmtMin && tempAmtMax
        ? `$${tempAmtMin} – $${tempAmtMax}`
        : tempAmtMin
          ? `≥ $${tempAmtMin}`
          : `≤ $${tempAmtMax}`
    addFilter({
      type: "amount",
      label: "Amount",
      value: JSON.stringify({ min: tempAmtMin, max: tempAmtMax }),
      displayValue: display,
    })
  }

  const activeCount = activeFilters.length

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Active filter chips */}
      {activeFilters.map((f) => (
        <Badge
          key={f.type}
          variant="secondary"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
        >
          <span className="text-muted-foreground">{f.label}:</span>
          <span>{f.displayValue}</span>
          <button
            onClick={() => removeFilter(f.type)}
            className="ml-0.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"
            aria-label={`Remove ${f.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Filter trigger */}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm" className="gap-1.5 h-8" />
          }
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <Badge
              variant="default"
              className="ml-0.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              {activeCount}
            </Badge>
          )}
        </PopoverTrigger>

        <PopoverContent align="end" className="w-72 p-0 overflow-hidden">
          {/* ── Step 1: Pick a filter type ── */}
          {!selectedType && (
            <div>
              <div className="px-3 py-2.5 border-b">
                <p className="text-sm font-semibold">Filter by</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose a filter type to apply
                </p>
              </div>
              <div className="py-1">
                {FILTER_TYPES.map(({ type, label, icon: Icon }) => {
                  const isActive = activeFilters.some((f) => f.type === type)
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {label}
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                        )}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )
                })}
              </div>

              {activeCount > 0 && (
                <div className="px-3 py-2 border-t">
                  <button
                    onClick={() => onFiltersChange([])}
                    className="text-xs text-destructive hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Filter-type specific controls ── */}
          {selectedType && (
            <div>
              {/* Header with back button */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b">
                <button
                  onClick={() => setSelectedType(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Back"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-semibold">
                  {FILTER_TYPES.find((f) => f.type === selectedType)?.label}
                </p>
              </div>

              <div className="p-3 space-y-3">

                {/* Spending Type */}
                {selectedType === "spendingType" && (
                  <>
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Select onValueChange={(v: any) => applySimpleFilter("spendingType", v || "")}>
                      <SelectTrigger className="w-full h-8 text-sm">
                        <SelectValue placeholder="Select spending type…" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPENDING_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

                {/* Category */}
                {selectedType === "category" && (
                  <>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <Select onValueChange={(v: any) => applySimpleFilter("category", v || "")}>
                      <SelectTrigger className="w-full h-8 text-sm">
                        <SelectValue placeholder="Select category…" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="__empty__" disabled>
                            No categories
                          </SelectItem>
                        ) : (
                          categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </>
                )}

                {/* Budget */}
                {selectedType === "budget" && (
                  <>
                    <Label className="text-xs text-muted-foreground">Budget</Label>
                    <Select onValueChange={(v: any) => applySimpleFilter("budget", v || "")}>
                      <SelectTrigger className="w-full h-8 text-sm">
                        <SelectValue placeholder="Select budget…" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgets.length === 0 ? (
                          <SelectItem value="__empty__" disabled>
                            No budgets
                          </SelectItem>
                        ) : (
                          budgets.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>
                              {b.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </>
                )}

                {/* Date Range */}
                {selectedType === "dateRange" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">From</Label>
                      <Input
                        type="date"
                        className="h-8 text-sm"
                        value={tempDateFrom}
                        onChange={(e) => setTempDateFrom(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">To</Label>
                      <Input
                        type="date"
                        className="h-8 text-sm"
                        value={tempDateTo}
                        onChange={(e) => setTempDateTo(e.target.value)}
                      />
                    </div>
                    <Button size="sm" className="w-full h-8 mt-1" onClick={applyDateRange}>
                      Apply
                    </Button>
                  </>
                )}

                {/* Amount Range */}
                {selectedType === "amount" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Min ($)</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        className="h-8 text-sm"
                        value={tempAmtMin}
                        onChange={(e) => setTempAmtMin(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Max ($)</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Any"
                        className="h-8 text-sm"
                        value={tempAmtMax}
                        onChange={(e) => setTempAmtMax(e.target.value)}
                      />
                    </div>
                    <Button size="sm" className="w-full h-8 mt-1" onClick={applyAmountRange}>
                      Apply
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
