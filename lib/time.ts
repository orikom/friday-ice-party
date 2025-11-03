import { format, formatInTimeZone } from "date-fns-tz";
import { toZonedTime } from "date-fns-tz";

const DEFAULT_TIMEZONE = "Asia/Jerusalem";

/**
 * Format a date in the default timezone (Asia/Jerusalem)
 */
export function formatDate(
  date: Date | string,
  formatStr: string = "PPp"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(dateObj, DEFAULT_TIMEZONE, formatStr);
}

/**
 * Convert a date to the default timezone
 */
export function toDefaultTimezone(date: Date): Date {
  return toZonedTime(date, DEFAULT_TIMEZONE);
}

/**
 * Get the default timezone
 */
export function getDefaultTimezone(): string {
  return DEFAULT_TIMEZONE;
}

/**
 * Format date range for display
 */
export function formatDateRange(
  startsAt: Date | null,
  endsAt: Date | null
): string {
  if (!startsAt) return "Date TBD";

  const startStr = formatDate(startsAt, "PPp");
  if (!endsAt) return startStr;

  const endStr = formatDate(endsAt, "pp"); // just time if same day
  const startDate = formatDate(startsAt, "yyyy-MM-dd");
  const endDate = formatDate(endsAt, "yyyy-MM-dd");

  if (startDate === endDate) {
    return `${formatDate(startsAt, "PP")} ${formatDate(
      startsAt,
      "p"
    )} - ${endStr}`;
  }

  return `${startStr} - ${formatDate(endsAt, "PPp")}`;
}
