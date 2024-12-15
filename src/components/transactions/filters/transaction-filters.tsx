"use client";

import React, { memo, useEffect } from "react";
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
import { Combobox } from "@/components/ui/combobox";
import { useQuery } from "@tanstack/react-query";
import { CategoryService } from "@/services/category-service";
import { Filters, useFilterHandler } from "@/hooks/use-filter-handler";

const categoryService = new CategoryService();

function TransactionFiltersComponent() {
  const { filters, updateFilters } = useFilterHandler();
  const [categorySearch, setCategorySearch] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState<Filters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories", categorySearch],
    queryFn: () => categoryService.search(categorySearch),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleApplyFilters = () => {
    updateFilters(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    updateFilters(clearedFilters);
    setIsOpen(false);
  };

  const mappedCategories = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Pesquisar transações..."
          value={localFilters.search || ""}
          onChange={(e) => {
            const value = e.target.value;
            setLocalFilters({ ...localFilters, search: value });
          }}
          className="w-full pl-9 bg-card"
        />
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
                date={localFilters.dateRange}
                onDateChange={(dateRange) =>
                  setLocalFilters({ ...localFilters, dateRange })
                }
              />
            </div>

            <div className="space-y-4">
              <Label>Categoria</Label>
              <Combobox
                options={mappedCategories}
                value={localFilters.categoryId}
                onValueChange={(value, label) =>
                  setLocalFilters({
                    ...localFilters,
                    categoryId: value,
                    categoryName: label,
                  })
                }
                placeholder="Selecione uma categoria..."
                searchPlaceholder="Buscar categoria..."
                onSearch={setCategorySearch}
                isLoading={isCategoriesLoading}
              />
            </div>

            <div className="space-y-4">
              <Label>Tipo</Label>
              <RadioGroup
                value={localFilters.type || ""}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    type: value as "income" | "expense" | undefined,
                  })
                }
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

            <div className="flex gap-2">
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="flex-1"
              >
                Limpar filtros
              </Button>
              <Button onClick={handleApplyFilters} className="flex-1">
                Aplicar filtros
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export const TransactionFilters = memo(TransactionFiltersComponent);
