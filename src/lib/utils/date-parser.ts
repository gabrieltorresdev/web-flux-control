"use client";

type DateResult = {
  date: Date | null;
  time: string | null;
  error?: string;
};

const MONTHS: Record<string, number> = {
  janeiro: 0, fevereiro: 1, março: 2, abril: 3,
  maio: 4, junho: 5, julho: 6, agosto: 7,
  setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
  // Abbreviations
  jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
  jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11
};

const WEEKDAYS: Record<string, number> = {
  domingo: 0, segunda: 1, "segunda-feira": 1,
  terça: 2, "terça-feira": 2, terca: 2, "terca-feira": 2,
  quarta: 3, "quarta-feira": 3,
  quinta: 4, "quinta-feira": 4,
  sexta: 5, "sexta-feira": 5,
  sábado: 6, sabado: 6
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTime(timeStr: string): string | null {
  const normalized = normalizeText(timeStr);

  // Special cases
  if (normalized.includes("meio-dia") || normalized.includes("meio dia")) {
    return "12:00";
  }
  if (normalized.includes("meia-noite") || normalized.includes("meia noite")) {
    return "00:00";
  }

  // Time patterns
  const patterns = [
    // 14:30, 14h30, 14h
    /(\d{1,2})[h:](\d{2})?/,
    // 2 da tarde, 3 da manhã
    /(\d{1,2})\s*(?:hora[s]?)?\s*(?:da|de|do)\s*(tarde|noite|manha|manhã)/,
    // 2 e (30|meia) da tarde
    /(\d{1,2})\s*e\s*(meia|\d{2})\s*(?:da|de|do)\s*(tarde|noite|manha|manhã)/
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      let minutes = "00";

      // Adjust for period
      if (match[2] === "tarde" || match[2] === "noite") {
        hours = hours === 12 ? 12 : hours + 12;
      } else if (match[2] === "manha" || match[2] === "manhã") {
        hours = hours === 12 ? 0 : hours;
      }

      // Adjust for minutes
      if (match[2] && !["tarde", "noite", "manha", "manhã"].includes(match[2])) {
        minutes = match[2] === "meia" ? "30" : match[2].padStart(2, "0");
      }

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }
  }

  return null;
}

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

function extractDateAndTime(text: string): { dateText: string; timeText: string } | null {
  const normalized = normalizeText(text);
  
  // Common patterns to split date and time
  const patterns = [
    // "date às time"
    /^(.+?)\s+(?:as|às|a|ao)\s+(.+)$/,
    // "time de/da/do date"
    /^(.+?)\s+(?:de|da|do)\s+(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      return {
        dateText: match[1],
        timeText: match[2],
      };
    }
  }

  return null;
}

function parseRelativeDate(text: string): Date | null {
  const normalized = normalizeText(text);
  
  if (normalized === "hoje") return new Date();
  if (normalized === "ontem") {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }

  // Last week
  if (normalized.includes("semana passada")) {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  }

  // Last month
  if (normalized.includes("mes passado")) {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  }

  // Days ago
  const daysAgoPatterns = [
    /ha\s*(\d+)\s*dias?/,
    /(\d+)\s*dias?\s*(atras|atraz|atrás|passados?)/
  ];

  for (const pattern of daysAgoPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const days = parseInt(match[1]);
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date;
    }
  }

  // Weekdays
  for (const [day, value] of Object.entries(WEEKDAYS)) {
    if (normalized.includes(day)) {
      return getLastWeekday(value);
    }
  }

  return null;
}

function parseAbsoluteDate(text: string): Date | null {
  const normalized = normalizeText(text);

  // Date patterns
  const patterns = [
    // 31 de março de 2024
    /(\d{1,2})[º°]?\s*(?:de|do)?\s*([a-zç]+?)(?:\s*(?:de|do)?\s*(\d{2,4}))?/,
    // 31/03/24 or 31-03-24
    /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const [_, day, monthStr, yearStr] = match;
      
      const monthNum = MONTHS[monthStr] ?? parseInt(monthStr) - 1;
      if (monthNum === undefined || monthNum < 0 || monthNum > 11) {
        continue;
      }

      const currentYear = new Date().getFullYear();
      let year = yearStr ? parseInt(yearStr) : currentYear;
      
      // Convert 2-digit year
      if (year < 100) {
        year += Math.floor(currentYear / 100) * 100;
        if (year > currentYear + 20) year -= 100;
      }

      const date = new Date(year, monthNum, parseInt(day));
      
      // Validate date
      if (isNaN(date.getTime())) {
        return null;
      }

      return date;
    }
  }

  return null;
}

export function parseSpokenDate(text: string): DateResult {
  const parts = extractDateAndTime(text);
  if (!parts) {
    return { 
      date: null, 
      time: null,
      error: "A entrada deve conter uma data e um horário" 
    };
  }

  const { dateText, timeText } = parts;
  const time = parseTime(timeText);
  if (!time) {
    return { 
      date: null, 
      time: null,
      error: "Horário inválido ou não reconhecido" 
    };
  }

  // Try parsing relative date first
  let date = parseRelativeDate(dateText);
  
  // If no relative date found, try absolute date
  if (!date) {
    date = parseAbsoluteDate(dateText);
  }

  if (!date) {
    return { 
      date: null, 
      time: null,
      error: "Data inválida ou não reconhecida" 
    };
  }

  // Validate that the date is not in the future
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours, minutes);

  if (date > now) {
    return { 
      date: null, 
      time: null,
      error: "A data e hora não podem estar no futuro" 
    };
  }

  return { date, time };
}