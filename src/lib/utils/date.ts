import { format } from "date-fns";

export function toLocalISOString(date: Date): string {
  return date.toISOString();
}

export function formatDateTimeLocal(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function localDateTimeToUTC(date: Date): Date {
  return date;
}
