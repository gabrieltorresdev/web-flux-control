"use client";

import { TimePeriod, type TimePeriodType } from "./constants";

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
}

export function adjustTimeByPeriod(hours: number, period?: string): number {
  if (!period) return hours;

  const normalizedPeriod = normalizeText(period) as TimePeriodType;

  if (TimePeriod.AFTERNOON.includes(normalizedPeriod as typeof TimePeriod.AFTERNOON[number]) || 
      TimePeriod.NIGHT.includes(normalizedPeriod as typeof TimePeriod.NIGHT[number])) {
    return hours === 12 ? 12 : hours + 12;
  }

  if (TimePeriod.MORNING.includes(normalizedPeriod as typeof TimePeriod.MORNING[number])) {
    return hours === 12 ? 0 : hours;
  }

  if (TimePeriod.MIDNIGHT.includes(normalizedPeriod as typeof TimePeriod.MIDNIGHT[number])) {
    return 0;
  }

  return hours;
}

export function validateDateTime(date: Date): boolean {
  const now = new Date();
  const normalizedDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  );
  const normalizedNow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes()
  );
  
  return normalizedDate <= normalizedNow;
}

export function formatTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}