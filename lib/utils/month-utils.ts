/**
 * Maps lowercase month names to their numeric equivalents (1–12).
 * Port of Laravel's `MonthUtils::LoadMonthMap()`.
 */
export const MONTH_MAP: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

/**
 * Returns the numeric month number for a given month name string,
 * or `undefined` if the name is invalid.
 *
 * @param month - e.g. `'january'`, `'FEBRUARY'` (case-insensitive)
 */
export function getMonthNumber(month: string): number | undefined {
  return MONTH_MAP[month.toLowerCase()];
}

/**
 * Returns true if the provided month string is a valid month name or `'all'`.
 */
export function isValidMonth(month: string): boolean {
  return month.toLowerCase() === 'all' || month.toLowerCase() in MONTH_MAP;
}
