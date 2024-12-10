"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { TransactionFilters } from "./transaction-filters";
import { CATEGORIES } from "@/types/transaction";
import { useTransactions } from "@/hooks/use-transactions";

type ActiveFiltersProps = {
  filters: TransactionFilters;
  onFilterRemove: (key: keyof TransactionFilters) => void;
};

export function ActiveFilters({ filters, onFilterRemove }: ActiveFiltersProps) {
  const { updateFilters } = useTransactions();

  const handleRemoveFilter = (key: keyof TransactionFilters) => {
    onFilterRemove(key);

    // Update URL query params based on the removed filter
    switch (key) {
      case "search":
        updateFilters({ search: undefined });
        break;
      case "dateRange":
        updateFilters({ from: undefined, to: undefined });
        break;
      case "category":
        updateFilters({ category: undefined });
        break;
      case "type":
        updateFilters({ type: undefined });
        break;
    }
  };

  if (!Object.keys(filters).length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {filters.search && (
        <Badge variant="secondary" className="gap-1">
          Busca: {filters.search}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => handleRemoveFilter("search")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.dateRange?.from && filters.dateRange?.to && (
        <Badge variant="secondary" className="gap-1">
          Período: {filters.dateRange.from.toLocaleDateString()} até{" "}
          {filters.dateRange.to.toLocaleDateString()}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => handleRemoveFilter("dateRange")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.category && (
        <Badge variant="secondary" className="gap-1">
          Categoria: {CATEGORIES[filters.category as keyof typeof CATEGORIES]}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => handleRemoveFilter("category")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.type && (
        <Badge variant="secondary" className="gap-1">
          Tipo: {filters.type === "income" ? "Entrada" : "Saída"}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => handleRemoveFilter("type")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
    </div>
  );
}
