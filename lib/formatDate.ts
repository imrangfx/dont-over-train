/**
 * Shared calendar date formatting for UI display.
 * Example: "6 Aug 2026"
 */

const DISPLAY_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

/**
 * Formats a date for display across the app.
 * Prefers timestamps; also accepts Date or parseable date strings.
 */
export function formatDisplayDate(
  input: string | number | Date | null | undefined,
): string {
  if (input == null || input === "") return "—";

  const date =
    input instanceof Date
      ? input
      : typeof input === "number"
        ? new Date(input)
        : new Date(input);

  if (Number.isNaN(date.getTime())) {
    return typeof input === "string" ? input : "—";
  }

  // en-GB → "6 Aug 2026" (day + short month + year, no locale slash ambiguity).
  return date.toLocaleDateString("en-GB", DISPLAY_OPTIONS);
}
