"use client";

import { parseSpokenDate } from "@/lib/utils/date-parser";

export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatDateTime(text: string): { date?: string; time?: string } {
  // Try to extract date from spoken text
  const { date, error } = parseSpokenDate(text);
  
  if (!date) {
    return {};
  }

  // Extract time if present (format: HH:mm or H:mm)
  const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
  let time: string | undefined;

  if (timeMatch) {
    const [_, hours, minutes] = timeMatch;
    time = `${hours.padStart(2, '0')}:${minutes}`;
  }

  return {
    date: date.toISOString().split('T')[0],
    time,
  };
}