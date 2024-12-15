"use client";

export const MONTHS: Record<string, number> = {
  janeiro: 0,
  fevereiro: 1,
  marco: 2,
  março: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
  // Abbreviations
  jan: 0,
  fev: 1,
  mar: 2,
  abr: 3,
  mai: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  set: 8,
  out: 9,
  nov: 10,
  dez: 11,
};

export const WEEKDAYS: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  "segunda-feira": 1,
  terca: 2,
  terça: 2,
  "terca-feira": 2,
  "terça-feira": 2,
  quarta: 3,
  "quarta-feira": 3,
  quinta: 4,
  "quinta-feira": 4,
  sexta: 5,
  "sexta-feira": 5,
  sabado: 6,
  sábado: 6,
};

export const TimePeriod = {
  MORNING: ["manha", "manhã", "madrugada"] as const,
  AFTERNOON: ["tarde"] as const,
  NIGHT: ["noite"] as const,
  MIDNIGHT: ["meia-noite", "meianoite"] as const,
} as const;

export type TimePeriodType = 
  | typeof TimePeriod.MORNING[number]
  | typeof TimePeriod.AFTERNOON[number]
  | typeof TimePeriod.NIGHT[number]
  | typeof TimePeriod.MIDNIGHT[number];

export const TIME_PATTERNS = [
  // 14:30, 14h30
  /(\d{1,2})(?::|\s*h\s*)(\d{2})?\s*(?:da\s*(manhã|tarde|noite))?/i,
  // 2 da tarde, 3 da manhã
  /(\d{1,2})\s*(?:hora[s]?)?\s*(?:da|de|do)\s*(tarde|noite|manha|manhã|madrugada)/i,
  // 2 e (30|meia) da tarde
  /(\d{1,2})\s*e\s*(meia|\d{2})\s*(?:da|de|do)\s*(tarde|noite|manha|manhã|madrugada)/i,
] as const;