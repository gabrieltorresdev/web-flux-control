"use client";

import { MONTHS, WEEKDAYS } from "./constants";
import type { DateMatch } from "./types";
import { adjustTimeByPeriod, normalizeText } from "./utils";

// Helper to get last occurrence of a weekday
function getLastWeekday(weekday: number): Date {
  const today = new Date();
  const targetDate = new Date(today);
  
  while (targetDate.getDay() !== weekday) {
    targetDate.setDate(targetDate.getDate() - 1);
  }
  
  // If today is the weekday we're looking for, go back a week
  if (targetDate.toDateString() === today.toDateString()) {
    targetDate.setDate(targetDate.getDate() - 7);
  }
  
  return targetDate;
}

export function parseAbsolutePattern(text: string): DateMatch | null {
  // Match patterns like "31 de março" or "31/03"
  const patterns = [
    /(\d{1,2})\s*(?:de\s+)?([a-zç]+)(?:\s+de\s+(\d{4}))?/i,
    /(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/
  ];

  for (const pattern of patterns) {
    const match = normalizeText(text).match(pattern);
    if (!match) continue;

    const [_, day, monthStr, yearStr] = match;
    const monthNum = MONTHS[monthStr] ?? parseInt(monthStr) - 1;
    
    if (monthNum === undefined || monthNum < 0 || monthNum > 11) continue;

    const currentYear = new Date().getFullYear();
    let year = yearStr ? parseInt(yearStr) : currentYear;
    
    // Convert 2-digit year
    if (year < 100) {
      year += Math.floor(currentYear / 100) * 100;
      if (year > currentYear + 20) year -= 100;
    }

    // Extract time
    const timeMatch = text.match(/(\d{1,2})(?::|\s*h\s*)(\d{2})?\s*(?:da\s*(manhã|tarde|noite))?/i);
    if (!timeMatch) return null;

    const hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3];

    return {
      day: parseInt(day),
      month: monthNum,
      year,
      hours: adjustTimeByPeriod(hours, period),
      minutes
    };
  }

  return null;
}

export function parseRelativePattern(text: string): DateMatch | null {
  const normalized = normalizeText(text);
  
  // Handle "hoje", "ontem", "anteontem"
  if (normalized.includes("hoje") || normalized.includes("ontem") || normalized.includes("anteontem")) {
    const date = new Date();
    if (normalized.includes("ontem")) {
      date.setDate(date.getDate() - 1);
    } else if (normalized.includes("anteontem")) {
      date.setDate(date.getDate() - 2);
    }

    const timeMatch = text.match(/(\d{1,2})(?::|\s*h\s*)(\d{2})?\s*(?:da\s*(manhã|tarde|noite))?/i);
    if (!timeMatch) return null;

    const hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3];

    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      hours: adjustTimeByPeriod(hours, period),
      minutes
    };
  }

  // Handle "há X dias/semanas"
  const relativeMatch = normalized.match(/há\s+(\d+)\s+(dia|semana)s?/);
  if (relativeMatch) {
    const [_, value, unit] = relativeMatch;
    const date = new Date();
    const amount = parseInt(value);

    if (unit === "semana") {
      date.setDate(date.getDate() - (amount * 7));
    } else {
      date.setDate(date.getDate() - amount);
    }

    const timeMatch = text.match(/(\d{1,2})(?::|\s*h\s*)(\d{2})?\s*(?:da\s*(manhã|tarde|noite))?/i);
    if (!timeMatch) return null;

    const hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3];

    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      hours: adjustTimeByPeriod(hours, period),
      minutes
    };
  }

  return null;
}

export function parseWeekdayPattern(text: string): DateMatch | null {
  const normalized = normalizeText(text);
  
  for (const [weekday, value] of Object.entries(WEEKDAYS)) {
    if (normalized.includes(weekday)) {
      const date = getLastWeekday(value);
      
      const timeMatch = text.match(/(\d{1,2})(?::|\s*h\s*)(\d{2})?\s*(?:da\s*(manhã|tarde|noite))?/i);
      if (!timeMatch) return null;

      const hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3];

      return {
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        hours: adjustTimeByPeriod(hours, period),
        minutes
      };
    }
  }

  return null;
}