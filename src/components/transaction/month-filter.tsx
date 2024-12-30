"use client";

import { useCallback, useRef, useState } from "react";
import { DateFilter } from "./date-filter";
import { useQueryParams } from "@/hooks/use-search-params";
import type { TransactionFilters as TransactionFiltersType } from "@/types/filters";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface MonthFilterProps {
  initialMonth?: string;
  initialYear?: string;
}

export function MonthFilter({ initialMonth, initialYear }: MonthFilterProps) {
  const router = useRouter();
  const { getParams } = useQueryParams<TransactionFiltersType>();
  const now = new Date();

  // Use o hook useRef para manter uma referência estável da data atual
  const currentDateRef = useRef(new Date());

  // Use o hook useState com uma função de inicialização
  const [currentDate, setCurrentDate] = useState(() => {
    const month = initialMonth ? parseInt(initialMonth) - 1 : now.getMonth();
    const year = initialYear ? parseInt(initialYear) : now.getFullYear();

    currentDateRef.current.setMonth(month);
    currentDateRef.current.setFullYear(year);
    return currentDateRef.current;
  });

  const updateURL = useCallback(
    (date: Date) => {
      const searchParams = new URLSearchParams(getParams());

      searchParams.set("month", (date.getMonth() + 1).toString());
      searchParams.set("year", date.getFullYear().toString());

      router.replace(`?${searchParams.toString()}`, { scroll: false });
    },
    [getParams, router]
  );

  const handleDateChange = useCallback(
    (newDate: Date) => {
      setCurrentDate(newDate);
      updateURL(newDate);
    },
    [updateURL]
  );

  const handlePreviousMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    handleDateChange(newDate);
  }, [currentDate, handleDateChange]);

  const handleNextMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    handleDateChange(newDate);
  }, [currentDate, handleDateChange]);

  const handleSelectMonth = useCallback(
    (month: number) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(month);
      handleDateChange(newDate);
    },
    [currentDate, handleDateChange]
  );

  const handleSelectYear = useCallback(
    (year: number) => {
      const newDate = new Date(currentDate);
      newDate.setFullYear(year);
      handleDateChange(newDate);
    },
    [currentDate, handleDateChange]
  );

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 hover:bg-muted/50"
        onClick={handlePreviousMonth}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <DateFilter
        currentDate={currentDate}
        onSelectMonth={handleSelectMonth}
        onSelectYear={handleSelectYear}
      />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 hover:bg-muted/50"
        onClick={handleNextMonth}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

MonthFilter.displayName = "MonthFilter";
