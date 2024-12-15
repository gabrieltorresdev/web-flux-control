"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TransactionFilters } from "./transaction-filters";
import { useTransactions } from "@/hooks/use-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { DateRange } from "react-day-picker";

type ActiveFiltersProps = {
  filters: TransactionFilters;
  onFilterRemove: (key: keyof TransactionFilters) => void;
};

export function ActiveFilters({ filters, onFilterRemove }: ActiveFiltersProps) {
  const { updateFilters } = useTransactions();

  const handleRemoveFilter = (key: keyof TransactionFilters) => {
    onFilterRemove(key);

    switch (key) {
      case "search":
        updateFilters({ search: undefined });
        break;
      case "dateRange":
        updateFilters({ startDate: undefined, endDate: undefined });
        break;
      case "categoryId":
        updateFilters({ categoryId: undefined });
        break;
      case "type":
        updateFilters({ type: undefined });
        break;
    }
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "dateRange") {
      value = value as DateRange;
      return value?.from && value?.to;
    }

    if (key === "categoryName") return false;

    value = value as string;
    return value && value.length > 0;
  });

  if (!hasActiveFilters) {
    return (
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-4">
          <p className="text-sm text-blue-600">
            Nenhum filtro aplicado. Use os filtros acima para refinar sua busca.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filters.search && (
        <Badge variant="secondary" className="gap-1 py-1 px-2">
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
        <Badge variant="secondary" className="gap-1 py-1 px-2">
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

      {filters.categoryId && filters.categoryName && (
        <Badge variant="secondary" className="gap-1 py-1 px-2">
          Categoria: {filters.categoryName}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => handleRemoveFilter("categoryId")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.type && (
        <Badge variant="secondary" className="gap-1 py-1 px-2">
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
