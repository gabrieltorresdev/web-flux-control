"use client";

import React, { memo } from "react";
import { Filter, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Combobox } from "@/components/ui/combobox";
import { CategoryService } from "@/services/category-service";
import { useQuery } from "@tanstack/react-query";
import { useFilterHandlers } from "./use-filter-handlers";

const categoryService = new CategoryService();

export type TransactionFilters = {
  search?: string;
  dateRange?: DateRange;
  category?: string;
  type?: "income" | "expense";
};

type TransactionFiltersProps = {
  filters: TransactionFilters;
  onFilterChange: (filters: TransactionFilters) => void;
};

function TransactionFiltersComponent({
  filters,
  onFilterChange,
}: TransactionFiltersProps) {
  const [categorySearch, setCategorySearch] = React.useState("");

  const {
    handleSearchChange,
    handleDateRangeChange,
    handleCategoryChange,
    handleTypeChange,
    handleClear,
  } = useFilterHandlers(filters, onFilterChange);

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories", categorySearch],
    queryFn: () => categoryService.search(categorySearch),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Pesquisar transações..."
          value={filters.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-9 bg-card"
        />
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <Label>Período</Label>
              <DateRangePicker
                date={filters.dateRange}
                onDateChange={handleDateRangeChange}
              />
            </div>

            <div className="space-y-4">
              <Label>Categoria</Label>
              <Combobox
                options={categories}
                value={filters.category}
                onValueChange={handleCategoryChange}
                placeholder="Selecione uma categoria..."
                searchPlaceholder="Buscar categoria..."
                onSearch={setCategorySearch}
                isLoading={isCategoriesLoading}
              />
            </div>

            <div className="space-y-4">
              <Label>Tipo</Label>
              <RadioGroup
                value={filters.type || ""}
                onValueChange={handleTypeChange}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="type-all" />
                  <Label htmlFor="type-all">Todos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="type-income" />
                  <Label htmlFor="type-income">Entradas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="type-expense" />
                  <Label htmlFor="type-expense">Saídas</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handleClear} variant="outline" className="w-full">
              Limpar filtros
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export const TransactionFilters = memo(TransactionFiltersComponent);
