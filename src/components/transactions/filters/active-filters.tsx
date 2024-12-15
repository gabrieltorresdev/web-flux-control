"use client";

import { memo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFilterHandler } from "@/hooks/use-filter-handler";
import { DateRange } from "react-day-picker";

function ActiveFiltersComponent() {
  const { filters, updateFilters } = useFilterHandler();

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
            onClick={() => updateFilters({ search: undefined })}
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
            onClick={() => updateFilters({ dateRange: undefined })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {(filters.categoryId || filters.categoryName) && (
        <Badge variant="secondary" className="gap-1 py-1 px-2">
          Categoria: {filters.categoryName ?? filters.categoryId}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => updateFilters({ categoryId: undefined })}
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
            onClick={() => updateFilters({ type: undefined })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
    </div>
  );
}

export const ActiveFilters = memo(ActiveFiltersComponent);
