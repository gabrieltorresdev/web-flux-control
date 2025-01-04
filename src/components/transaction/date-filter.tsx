"use client";

import { MonthPicker } from "../ui/month-picker";

interface DateFilterProps {
  currentDate: Date;
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
  disabled?: boolean;
}

export function DateFilter({
  currentDate,
  onSelectMonth,
  onSelectYear,
  disabled,
}: DateFilterProps) {
  function handleSelect({ month, year }: { month: number; year: number }) {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    if (year !== currentYear) {
      onSelectYear(year);
    }
    if (month !== currentMonth) {
      onSelectMonth(month);
    }
  }

  return (
    <MonthPicker
      className="w-full"
      value={currentDate}
      onSelect={handleSelect}
      aria-label="Select month and year"
      disabled={disabled}
    />
  );
}
