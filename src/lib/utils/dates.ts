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
