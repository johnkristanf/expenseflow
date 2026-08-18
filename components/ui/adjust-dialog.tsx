"use client"

import * as React from "react"
import { ArrowUpDown, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

export interface AdjustData {
  amount: number
  type: "increment" | "decrement" | "move"
  accountId?: number
  reason?: string
  targetBudgetId?: number
}

type Tab = "increment" | "decrement" | "move"

export function AdjustDialog({
  triggerId,
  name,
  description = "Add funds from an account or deduct from the balance.",
  accounts = [],
  budgets = [],
  onConfirm,
  loading,
  allowedTabs = ["increment", "decrement", "move"],
  showAccountSelector = true,
}: {
  triggerId: string
  name: string
  description?: string
  accounts?: { id: number; name: string }[]
  budgets?: { id: number; name: string }[]
  onConfirm: (data: AdjustData) => void
  loading: boolean
  allowedTabs?: Tab[]
  showAccountSelector?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<Tab>("increment")
  const [amount, setAmount] = React.useState("")
  const [accountId, setAccountId] = React.useState("")
  const [targetBudgetId, setTargetBudgetId] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [err, setErr] = React.useState("")

  function reset() {
    setTab("increment")
    setAmount("")
    setAccountId("")
    setTargetBudgetId("")
    setReason("")
    setErr("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amount || isNaN(amt) || amt <= 0) {
      setErr("Enter a valid positive amount.")
      return
    }
    if (tab === "increment" && showAccountSelector && !accountId) {
      setErr("Select an account to transfer from.")
      return
    }
    if (tab === "move" && !targetBudgetId) {
      setErr("Select a target budget to move funds to.")
      return
    }
    setErr("")
    onConfirm({
      amount: amt,
      type: tab,
      accountId: tab === "increment" ? parseInt(accountId, 10) : undefined,
      reason: tab === "decrement" ? reason || undefined : undefined,
      targetBudgetId: tab === "move" ? parseInt(targetBudgetId, 10) : undefined,
    })
    setOpen(false)
    reset()
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; activeClass: string; hoverClass: string }[] = [
    {
      key: "increment",
      label: "Increment",
      icon: <TrendingUp className="h-4 w-4" />,
      activeClass: "border-emerald-500/50 bg-emerald-500/15 text-emerald-400",
      hoverClass: "hover:border-emerald-500/30",
    },
    {
      key: "decrement",
      label: "Decrement",
      icon: <TrendingDown className="h-4 w-4" />,
      activeClass: "border-rose-500/50 bg-rose-500/15 text-rose-400",
      hoverClass: "hover:border-rose-500/30",
    },
    {
      key: "move",
      label: "Move",
      icon: <ArrowRightLeft className="h-4 w-4" />,
      activeClass: "border-violet-500/50 bg-violet-500/15 text-violet-400",
      hoverClass: "hover:border-violet-500/30",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger
        render={
          <button
            id={triggerId}
            title="Adjust"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-blue-500/15 hover:text-blue-400"
          />
        }
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust — {name}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-4 py-2">
            {/* Tab selector */}
            <div className="grid grid-cols-3 gap-2" style={{ gridTemplateColumns: `repeat(${tabs.filter(t => allowedTabs.includes(t.key)).length}, minmax(0, 1fr))` }}>
              {tabs.filter(t => allowedTabs.includes(t.key)).map(({ key, label, icon, activeClass, hoverClass }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setTab(key); setErr("") }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    tab === key
                      ? activeClass
                      : `border-border text-muted-foreground ${hoverClass}`
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${triggerId}-amount`} className="text-sm font-medium">
                Amount <span className="text-destructive">*</span>
              </label>
              <input
                id={`${triggerId}-amount`}
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>

            {/* From Account — increment only */}
            {tab === "increment" && showAccountSelector && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${triggerId}-account`} className="text-sm font-medium">
                  From Account <span className="text-destructive">*</span>
                </label>
                <select
                  id={`${triggerId}-account`}
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="" disabled>Select account…</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={String(a.id)}>{a.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Reason — decrement only */}
            {tab === "decrement" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${triggerId}-reason`} className="text-sm font-medium">
                  Reason <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <input
                  id={`${triggerId}-reason`}
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Emergency withdrawal"
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
            )}

            {/* Target Budget — move only */}
            {tab === "move" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${triggerId}-target-budget`} className="text-sm font-medium">
                  To Budget <span className="text-destructive">*</span>
                </label>
                <select
                  id={`${triggerId}-target-budget`}
                  value={targetBudgetId}
                  onChange={(e) => setTargetBudgetId(e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="" disabled>Select budget…</option>
                  {budgets.map((b) => (
                    <option key={b.id} value={String(b.id)}>{b.name}</option>
                  ))}
                </select>
                {budgets.length === 0 && (
                  <p className="text-xs text-muted-foreground">No other budgets available.</p>
                )}
              </div>
            )}

            {err && <p className="text-xs text-destructive">{err}</p>}
          </div>

          <DialogFooter className="mt-4" showCloseButton={false}>
            <DialogClose render={<Button type="button" variant="outline" disabled={loading} />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={loading || (tab === "move" && budgets.length === 0)}>
              {loading ? "Saving…" : "Apply"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
