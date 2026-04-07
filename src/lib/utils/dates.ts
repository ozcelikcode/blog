import { format } from "date-fns";

export function formatPublishedDate(value: string): string {
  return format(new Date(value), "MMMM d, yyyy");
}

export function formatIsoDateTime(value: string): string {
  return new Date(value).toISOString();
}

export function getCurrentIsoTimestamp(): string {
  return new Date().toISOString();
}

export function formatRelativeAdminDate(value: string): string {
  return format(new Date(value), "MMM d, yyyy 'at' HH:mm");
}

export function toDateTimeLocalInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const pad = (input: number): string => String(input).padStart(2, "0");

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}
