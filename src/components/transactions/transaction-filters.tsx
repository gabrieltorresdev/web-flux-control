"use client";

import React from "react";
import { Filter, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { DateRangePicker } from "../ui/date-picker";
import { DateRange } from "react-day-picker";
import { Combobox } from "../ui/combobox";
import { CategoryService } from "@/services/category-service";
import { useQuery } from "@tanstack/react-query";
import { useTransactions } from "@/hooks/use-transactions";
import { useSearchParams } from "next/navigation";

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

export function TransactionFilters({
  filters,
  onFilterChange,
}: TransactionFiltersProps) {
  const [categorySearch, setCategorySearch] = React.useState("");
  const { updateFilters } = useTransactions();
  const searchParams = useSearchParams();

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories", categorySearch],
    queryFn: () => categoryService.search(categorySearch),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFilterChange({ ...filters, search: value });
    updateFilters({ search: value || undefined });
  };

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    onFilterChange({ ...filters, dateRange });
    if (dateRange?.from && dateRange?.to) {
      updateFilters({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
    } else {
      updateFilters({ from: undefined, to: undefined });
    }
  };

  const handleCategoryChange = (value: string) => {
    onFilterChange({ ...filters, category: value || undefined });
    updateFilters({ category: value || undefined });
  };

  const handleTypeChange = (value: string) => {
    const type = value as "income" | "expense" | undefined;
    onFilterChange({ ...filters, type });
    updateFilters({ type: type || undefined });
  };

  const handleClear = () => {
    onFilterChange({});
    updateFilters({
      search: undefined,
      category: undefined,
      type: undefined,
      from: undefined,
      to: undefined,
    });
  };

  // Initialize filters from URL on mount
  React.useEffect(() => {
    const urlFilters: TransactionFilters = {};

    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const type = searchParams.get("type") as "income" | "expense" | undefined;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (search) urlFilters.search = search;
    if (category) urlFilters.category = category;
    if (type) urlFilters.type = type;
    if (from && to) {
      urlFilters.dateRange = {
        from: new Date(from),
        to: new Date(to),
      };
    }

    if (Object.keys(urlFilters).length > 0) {
      onFilterChange(urlFilters);
    }
  }, [searchParams, onFilterChange]);

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Pesquisar transações..."
          value={filters.search || ""}
          onChange={handleSearchChange}
          className="w-full pl-9"
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
