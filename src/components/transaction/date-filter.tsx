import * as React from "react";
import { MonthPicker } from "../ui/month-picker";

interface DateFilterProps {
  /** The currently selected date */
  currentDate: Date;
  /** Callback fired when a month is selected */
  onSelectMonth: (month: number) => void;
  /** Callback fired when a year is selected */
  onSelectYear: (year: number) => void;
}

export const DateFilter = React.memo(function DateFilter({
  currentDate,
  onSelectMonth,
  onSelectYear,
}: DateFilterProps) {
  const handleSelect = React.useCallback(
    ({ month, year }: { month: number; year: number }) => {
      // Only update if values actually changed to prevent unnecessary rerenders
      if (year !== currentDate.getFullYear()) {
        onSelectYear(year);
      }
      if (month !== currentDate.getMonth()) {
        onSelectMonth(month);
      }
    },
    [currentDate, onSelectMonth, onSelectYear]
  );

  return (
    <MonthPicker
      className="w-full"
      value={currentDate}
      onSelect={handleSelect}
    />
  );
});

DateFilter.displayName = "DateFilter";
