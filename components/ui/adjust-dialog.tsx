"use client"

import * as React from "react"
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react"

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
  type: "increment" | "decrement"
  accountId?: number
  reason?: string
}

export function AdjustDialog({
  triggerId,
  name,
  description = "Add funds from an account or deduct from the balance.",
  accounts,
  onConfirm,
  loading,
}: {
  triggerId: string
  name: string
  description?: string
  accounts: { id: number; name: string }[]
  onConfirm: (data: AdjustData) => void
  loading: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState<"increment" | "decrement">("increment")
  const [amount, setAmount] = React.useState("")
  const [accountId, setAccountId] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [err, setErr] = React.useState("")

  function reset() {
    setType("increment")
    setAmount("")
    setAccountId("")
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
    if (type === "increment" && !accountId) {
      setErr("Select an account to transfer from.")
      return
    }
    setErr("")
    onConfirm({
      amount: amt,
      type,
      accountId: type === "increment" ? parseInt(accountId, 10) : undefined,
      reason: type === "decrement" ? reason || undefined : undefined,
    })
    setOpen(false)
    reset()
  }

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
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("increment")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  type === "increment"
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                    : "border-border text-muted-foreground hover:border-emerald-500/30"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Increment
              </button>
              <button
                type="button"
                onClick={() => setType("decrement")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  type === "decrement"
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-400"
                    : "border-border text-muted-foreground hover:border-rose-500/30"
                }`}
              >
                <TrendingDown className="h-4 w-4" />
                Decrement
              </button>
            </div>

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

            {type === "increment" && (
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

            {type === "decrement" && (
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

            {err && <p className="text-xs text-destructive">{err}</p>}
          </div>

          <DialogFooter className="mt-4" showCloseButton={false}>
            <DialogClose render={<Button type="button" variant="outline" disabled={loading} />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Apply"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
