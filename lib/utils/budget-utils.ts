/**
 * Calculates progress percentage between 0 and 100 based on current vs total amount.
 */
export function getProgress(current: string | number, total: string | number): number {
  const c = typeof current === "number" ? current : parseFloat(current)
  const t = typeof total === "number" ? total : parseFloat(total)
  if (!t) return 0
  return Math.min(100, Math.max(0, (c / t) * 100))
}

/**
 * Returns gradient color classes based on budget remaining percentage.
 */
export function getProgressColor(pct: number): string {
  if (pct >= 75) return "from-emerald-500 to-emerald-400"
  if (pct >= 40) return "from-amber-500 to-amber-400"
  return "from-rose-500 to-rose-400"
}
