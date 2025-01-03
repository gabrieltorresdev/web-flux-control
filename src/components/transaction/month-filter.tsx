"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { DateFilter } from "./date-filter";
import { useQueryParams } from "@/hooks/use-search-params";
import type { TransactionFilters as TransactionFiltersType } from "@/types/filters";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/lib/use-debounce";
import { useTransactions } from "@/hooks/use-transactions";

interface MonthFilterProps {
  initialMonth?: string;
  initialYear?: string;
}

export function MonthFilter({ initialMonth, initialYear }: MonthFilterProps) {
  const router = useRouter();
  const { getParams } = useQueryParams<TransactionFiltersType>();
  const now = new Date();
  const { isLoading, setLoading, startTransition } = useTransactions();
  const [isChangingMonth, setIsChangingMonth] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

  // Debounce the current date changes
  const debouncedDate = useDebounce(currentDate, 500);

  // Update URL when debounced date changes
  useEffect(() => {
    const searchParams = new URLSearchParams(getParams());
    searchParams.set("month", (debouncedDate.getMonth() + 1).toString());
    searchParams.set("year", debouncedDate.getFullYear().toString());

    startTransition(() => {
      router.replace(`?${searchParams.toString()}`, { scroll: false });
    });
  }, [debouncedDate, getParams, router, startTransition]);

  const handleDateChange = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const debouncedHandleDateChange = useCallback(
    (newDate: Date) => {
      handleDateChange(newDate);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsChangingMonth(true);
        setLoading(true);
      }, 500);
    },
    [handleDateChange, setLoading]
  );

  useEffect(() => {
    if (!isLoading) {
      setIsChangingMonth(false);
    }
  }, [isLoading]);

  const handlePreviousMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    debouncedHandleDateChange(newDate);
  }, [currentDate, debouncedHandleDateChange]);

  const handleNextMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    debouncedHandleDateChange(newDate);
  }, [currentDate, debouncedHandleDateChange]);

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
        disabled={isChangingMonth}
      >
        {isChangingMonth ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <DateFilter
        currentDate={currentDate}
        onSelectMonth={handleSelectMonth}
        onSelectYear={handleSelectYear}
        disabled={isChangingMonth}
      />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 hover:bg-muted/50"
        onClick={handleNextMonth}
        aria-label="Próximo mês"
        disabled={isChangingMonth}
      >
        {isChangingMonth ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

MonthFilter.displayName = "MonthFilter";
