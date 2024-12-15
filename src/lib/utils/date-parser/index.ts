"use client";

import { parseAbsolutePattern, parseRelativePattern, parseWeekdayPattern } from "./patterns";
import { validateDateTime, isValidDate } from "./utils";
import type { DateResult } from "./types";

export function parseSpokenDate(text: string): DateResult {
  // Try all patterns in sequence
  const patterns = [
    parseAbsolutePattern,
    parseRelativePattern,
    parseWeekdayPattern
  ];

  for (const parser of patterns) {
    const match = parser(text);
    if (!match) continue;

    const { day, month, year, hours, minutes } = match;
    const date = new Date(year, month, day, hours, minutes);

    // Validate the date
    if (!isValidDate(date)) {
      return {
        date: null,
        time: null,
        error: "Data inválida"
      };
    }

    // Validate that the date is not in the future
    if (!validateDateTime(date)) {
      return {
        date: null,
        time: null,
        error: "A data e hora não podem estar no futuro"
      };
    }

    return {
      date,
      time: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    };
  }

  return {
    date: null,
    time: null,
    error: "Formato de data e hora não reconhecido"
  };
}