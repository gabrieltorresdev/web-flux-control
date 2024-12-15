"use client";

const MONTHS: Record<string, string> = {
  janeiro: "01",
  fevereiro: "02",
  março: "03",
  abril: "04",
  maio: "05",
  junho: "06",
  julho: "07",
  agosto: "08",
  setembro: "09",
  outubro: "10",
  novembro: "11",
  dezembro: "12",
};

export function formatDateForInput(dateStr: string): string {
  const [day, month, year] = dateStr
    .split(" de ")
    .map((part, index) => {
      if (index === 1) {
        return MONTHS[part] || "01";
      }
      return part;
    });
  return `${year}-${month}-${day.padStart(2, "0")}`;
}