"use client";

import { useCallback } from "react";
import { DateRange } from "react-day-picker";
import type { TransactionFilters } from "./transaction-filters";
import { useTransactions } from "@/hooks/use-transactions";

export function useFilterHandlers(
  filters: TransactionFilters,
  onFilterChange: (filters: TransactionFilters) => void
) {
  const { updateFilters } = useTransactions();

  const handleSearchChange = useCallback(
    (value: string) => {
      onFilterChange({ ...filters, search: value });
      updateFilters({ search: value || undefined });
    },
    [filters, onFilterChange, updateFilters]
  );

  const handleDateRangeChange = useCallback(
    (dateRange: DateRange | undefined) => {
      onFilterChange({ ...filters, dateRange });
      if (dateRange?.from && dateRange?.to) {
        updateFilters({
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        });
      } else {
        updateFilters({ from: undefined, to: undefined });
      }
    },
    [filters, onFilterChange, updateFilters]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      onFilterChange({ ...filters, category: value || undefined });
      updateFilters({ category: value || undefined });
    },
    [filters, onFilterChange, updateFilters]
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      const type = value as "income" | "expense" | undefined;
      onFilterChange({ ...filters, type });
      updateFilters({ type: type || undefined });
    },
    [filters, onFilterChange, updateFilters]
  );

  const handleClear = useCallback(() => {
    onFilterChange({});
    updateFilters({
      search: undefined,
      category: undefined,
      type: undefined,
      from: undefined,
      to: undefined,
    });
  }, [onFilterChange, updateFilters]);

  return {
    handleSearchChange,
    handleDateRangeChange,
    handleCategoryChange,
    handleTypeChange,
    handleClear,
  };
}
