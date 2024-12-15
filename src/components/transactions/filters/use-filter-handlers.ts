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
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
        });
      } else {
        updateFilters({ startDate: undefined, endDate: undefined });
      }
    },
    [filters, onFilterChange, updateFilters]
  );

  const handleCategoryChange = useCallback(
    (value: string, label?: string) => {
      onFilterChange({
        ...filters,
        categoryId: value || undefined,
        categoryName: label,
      });
      updateFilters({ categoryId: value || undefined });
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
      categoryId: undefined,
      type: undefined,
      startDate: undefined,
      endDate: undefined,
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
