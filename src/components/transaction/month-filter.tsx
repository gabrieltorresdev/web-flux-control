"use client";

import * as React from "react";
import { DateFilter } from "./date-filter";
import { useQueryParams } from "@/src/hooks/use-search-params";
import type { TransactionFilters as TransactionFiltersType } from "@/src/types/filters";
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

  // Inicializa com os valores da URL ou data atual
  const [currentDate, setCurrentDate] = React.useState(() => {
    // Converte o mês de 1-12 para 0-11 para o Date
    const month = initialMonth ? parseInt(initialMonth) - 1 : now.getMonth();
    const year = initialYear ? parseInt(initialYear) : now.getFullYear();

    const date = new Date();
    date.setMonth(month);
    date.setFullYear(year);
    return date;
  });

  const updateURL = React.useCallback(
    (date: Date) => {
      const currentParams = new URLSearchParams();
      const params = getParams();

      // Preserve existing params
      Object.entries(params).forEach(([key, value]) => {
        if (key !== "month" && key !== "year" && value) {
          currentParams.set(key, value);
        }
      });

      // Add new date params
      currentParams.set("month", (date.getMonth() + 1).toString());
      currentParams.set("year", date.getFullYear().toString());

      router.push(`?${currentParams.toString()}`);
    },
    [getParams, router]
  );

  const handlePreviousMonth = React.useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
    updateURL(newDate);
  }, [currentDate, updateURL]);

  const handleNextMonth = React.useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
    updateURL(newDate);
  }, [currentDate, updateURL]);

  const handleSelectMonth = React.useCallback(
    (month: number) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(month);
      setCurrentDate(newDate);
      updateURL(newDate);
    },
    [currentDate, updateURL]
  );

  const handleSelectYear = React.useCallback(
    (year: number) => {
      const newDate = new Date(currentDate);
      newDate.setFullYear(year);
      setCurrentDate(newDate);
      updateURL(newDate);
    },
    [currentDate, updateURL]
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
