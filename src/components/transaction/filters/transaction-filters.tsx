"use client";

import * as React from "react";
import { CategoryFilter } from "./category-filter";
import { Input } from "@/src/components/ui/input";
import { useQueryParams } from "@/src/hooks/use-search-params";
import type { TransactionFilters as TransactionFiltersType } from "@/src/types/filters";
import { useDebounce } from "@/src/hooks/use-debounce";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Card } from "../../ui/card";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { Badge } from "../../ui/badge";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";

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
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState(initialCategoryId);

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

  // Atualiza o estado quando initialCategoryId muda
  React.useEffect(() => {
    setSelectedCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  // Debounce search to avoid too many requests
  useDebounce(updateSearch, 500, [search]);

  const hasActiveFilters = search || selectedCategoryId;

  const handleClearSearch = React.useCallback(() => {
    setSearch("");
    setParam("search", null);
  }, [setParam]);

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
            {selectedCategoryId && (
              <CategoryFilter
                initialCategoryId={selectedCategoryId}
                showAsBadge
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
                onCategoryChange={setSelectedCategoryId}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Card>
  );
}

TransactionFilters.displayName = "TransactionFilters";
