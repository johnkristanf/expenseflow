const PHP_FORMAT = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

/**
 * Formats a numeric value or numeric string as Philippine Peso (₱).
 * Returns "₱0.00" for NaN / null / undefined inputs.
 */
export function formatCurrency(val: number | string | null | undefined): string {
  const num = typeof val === "number" ? val : parseFloat(String(val ?? ""));
  return isNaN(num) ? "₱0.00" : PHP_FORMAT.format(num);
}
