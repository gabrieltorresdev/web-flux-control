"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryFilter } from "./category-filter";
import { useQueryParams } from "@/hooks/use-search-params";
import { TransactionFilters as TransactionFiltersType } from "@/types/filters";
import { CategoryBadge } from "./category-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCategories } from "@/hooks/use-categories";

interface TransactionFiltersProps {
  initialCategoryId?: string;
  initialSearch?: string;
  className?: string;
}

export function TransactionFilters({
  initialCategoryId,
  initialSearch,
  className,
}: TransactionFiltersProps) {
  const { setParam } = useQueryParams<TransactionFiltersType>();
  const [search, setSearch] = React.useState(initialSearch ?? "");
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState(initialCategoryId);
  const [isOpen, setIsOpen] = React.useState(false);
  const { data, isLoading } = useCategories();
  const categories = data?.data ?? [];

  const selectedCategory = React.useMemo(
    () => categories.find((cat) => cat.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const updateSearch = React.useCallback(
    (value: string) => {
      if (value) {
        setParam("search", value);
      } else {
        setParam("search", null);
      }
    },
    [setParam]
  );

  const handleCategoryChange = React.useCallback(
    (categoryId: string | undefined) => {
      setSelectedCategoryId(categoryId);
      setParam("categoryId", categoryId ?? null);
    },
    [setParam]
  );

  const handleClearSearch = React.useCallback(() => {
    setSearch("");
    setParam("search", null);
  }, [setParam]);

  React.useEffect(() => {
    setSelectedCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  // Update search params when search changes
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateSearch(search);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, updateSearch]);

  const hasActiveFilters = search || selectedCategoryId;

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="flex items-center gap-3 p-3">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded shrink-0 animate-pulse" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="flex items-center gap-3 p-3">
        <ScrollArea className="flex-1">
          <div className="flex items-center gap-2">
            {!hasActiveFilters && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Sem filtros ativos
              </span>
            )}
            {search && (
              <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                <span className="truncate max-w-[200px]">{search}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={handleClearSearch}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedCategory && (
              <CategoryBadge
                category={selectedCategory}
                onRemove={() => handleCategoryChange(undefined)}
              />
            )}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label="Filtros avançados"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros avançados</SheetTitle>
              <SheetDescription />
            </SheetHeader>
            <div className="space-y-6 pt-8">
              <div className="space-y-1.5">
                <Label>Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Pesquisar transações..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-8"
                  />
                </div>
              </div>
              <CategoryFilter
                initialCategoryId={selectedCategoryId}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Card>
  );
}

TransactionFilters.displayName = "TransactionFilters";
