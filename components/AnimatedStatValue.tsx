"use client";

import { useCountUp } from "@/lib/hooks/useCountUp";

/**
 * Renders an already-formatted stat string (e.g. "42.5 kg", "1,240 kg",
 * "+1.2 kg/week", "82% Consistent") with its leading number animating on
 * a count-up whenever it changes, while any unit/suffix text stays static.
 * Purely presentational: never re-derives or re-formats the underlying
 * value, it only re-renders the same formatted number as it counts up.
 *
 * Strings that aren't a plain leading number (dates, "-", "Improving",
 * month names) render unchanged - detected by requiring the string to
 * start with a digit/sign and the remainder to NOT start with "/" (a date
 * separator, e.g. "7/19/2026").
 */
const LEADING_NUMBER = /^([+-]?)([\d,]+(?:\.\d+)?)/;

export default function AnimatedStatValue({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const match = value.match(LEADING_NUMBER);
  const suffix = match ? value.slice(match[0].length) : "";
  const isAnimatable = Boolean(match) && !suffix.startsWith("/");

  const sign = match?.[1] ?? "";
  const digits = match?.[2] ?? "0";
  const numeric = isAnimatable ? parseFloat(digits.replace(/,/g, "")) * (sign === "-" ? -1 : 1) : 0;
  const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;

  // Always called (rules of hooks) - simply animates toward 0 and is
  // ignored below when the value isn't a plain leading number.
  const animated = useCountUp(numeric);

  if (!isAnimatable) {
    return <span className={className}>{value}</span>;
  }

  const showPlus = sign === "+" && animated >= 0;
  const formatted = animated.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {showPlus ? "+" : ""}
      {formatted}
      {suffix}
    </span>
  );
}
