import * as React from "react";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { ScrollArea } from "@/src/components/ui/scroll-area";

type MonthPickerProps = {
  /** The currently selected date */
  value: Date;
  /** Callback fired when a month/year is selected */
  onSelect: (date: { month: number; year: number }) => void;
  /** Additional class names */
  className?: string;
};

const MONTHS = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
] as const;

const INITIAL_YEAR = 2000;

const generateYearRange = (currentYear: number): number[] => {
  const years: number[] = [];
  for (let year = currentYear; year >= INITIAL_YEAR; year--) {
    years.push(year);
  }
  return years;
};

export const MonthPicker = React.memo(function MonthPicker({
  value,
  onSelect,
  className,
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState(value.getFullYear());

  const currentMonth = value.getMonth();
  const currentYear = value.getFullYear();

  // Memoize years array since it only depends on the current year
  const years = React.useMemo(
    () => generateYearRange(new Date().getFullYear()),
    []
  );

  // Reset selected year when value changes
  React.useEffect(() => {
    setSelectedYear(value.getFullYear());
  }, [value]);

  const handleSelectMonth = React.useCallback(
    (month: number) => {
      onSelect({ month, year: selectedYear });
      setIsOpen(false);
    },
    [selectedYear, onSelect]
  );

  const handleSelectYear = React.useCallback(
    (year: number) => {
      setSelectedYear(year);
      onSelect({ month: currentMonth, year });
    },
    [currentMonth, onSelect]
  );

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            aria-label="Selecionar mês e ano"
          >
            <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>
              {MONTHS[currentMonth]} {currentYear}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto p-0" align="start">
          <div className="flex" role="dialog" aria-label="Calendário">
            <div className="flex flex-col">
              <div
                className="grid grid-cols-3 gap-2 p-3"
                role="listbox"
                aria-label="Meses"
              >
                {MONTHS.map((month, index) => {
                  const isSelected =
                    index === currentMonth &&
                    selectedYear === value.getFullYear();

                  return (
                    <div
                      key={month}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectMonth(index)}
                      className={cn(
                        "flex h-9 w-16 items-center justify-center rounded-md text-sm",
                        "cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                        isSelected && "bg-primary text-primary-foreground"
                      )}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectMonth(index);
                        }
                      }}
                    >
                      {month}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="border-l" role="listbox" aria-label="Anos">
              <ScrollArea className="h-[192px] px-1.5 pb-0">
                <div className="py-2 flex flex-col gap-1">
                  {years.map((year) => (
                    <div
                      key={year}
                      role="option"
                      aria-selected={selectedYear === year}
                      onClick={() => handleSelectYear(year)}
                      className={cn(
                        "px-3 py-1 rounded-md text-sm",
                        "cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                        selectedYear === year &&
                          "bg-primary text-primary-foreground"
                      )}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectYear(year);
                        }
                      }}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});
