/**
 * Shared calendar date formatting for UI display.
 * Example: "6 Aug 2026"
 */

const DISPLAY_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

function toValidDate(
  input: string | number | Date | null | undefined,
): Date | null {
  if (input == null || input === "") return null;

  const date =
    input instanceof Date
      ? input
      : typeof input === "number"
        ? new Date(input)
        : new Date(input);

  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a date for display across the app.
 * Prefers timestamps; also accepts Date or parseable date strings.
 */
export function formatDisplayDate(
  input: string | number | Date | null | undefined,
): string {
  const date = toValidDate(input);
  if (!date) {
    return typeof input === "string" && input ? input : "—";
  }

  // en-GB → "6 Aug 2026" (day + short month + year, no locale slash ambiguity).
  return date.toLocaleDateString("en-GB", DISPLAY_OPTIONS);
}

/** Month section header, e.g. "August 2026". */
export function formatMonthYear(
  input: string | number | Date | null | undefined,
): string {
  const date = toValidDate(input);
  if (!date) return "—";

  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

/** Sort key for month groups: YYYY-MM (newest first when sorted descending). */
export function monthGroupKey(
  input: string | number | Date | null | undefined,
): string {
  const date = toValidDate(input);
  if (!date) return "unknown";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Stacked date column parts for history cards: WED / 6 / AUG. */
export function formatHistoryDateParts(
  input: string | number | Date | null | undefined,
): { weekday: string; day: string; month: string } {
  const date = toValidDate(input);
  if (!date) {
    return { weekday: "—", day: "—", month: "—" };
  }

  return {
    weekday: date
      .toLocaleDateString("en-GB", { weekday: "short" })
      .toUpperCase(),
    day: String(date.getDate()),
    month: date
      .toLocaleDateString("en-GB", { month: "short" })
      .toUpperCase(),
  };
}
