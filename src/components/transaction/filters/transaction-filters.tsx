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
import { useIsMobile } from "@/hooks/use-mobile";
import { Category } from "@/types/category";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FilterButton } from "./filter-button";

interface TransactionFiltersProps {
  initialCategoryId?: string;
  initialCategory?: Category;
  initialSearch?: string;
  className?: string;
}

// Componente reutilizável para o badge do filtro
const FilterBadge = motion(Badge);

export function TransactionFilters({
  initialCategoryId,
  initialCategory,
  initialSearch,
  className,
}: TransactionFiltersProps) {
  const { setParam } = useQueryParams<TransactionFiltersType>();
  const [search, setSearch] = React.useState(initialSearch ?? "");
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState(initialCategoryId);
  const [selectedCategory, setSelectedCategory] =
    React.useState(initialCategory);
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();

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
    (categoryId: string | undefined, category?: Category) => {
      setSelectedCategoryId(categoryId);
      setSelectedCategory(category);
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
    setSelectedCategory(initialCategory);
  }, [initialCategoryId, initialCategory]);

  // Update search params when search changes
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateSearch(search);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, updateSearch]);

  const hasActiveFilters = search || selectedCategoryId;

  return (
    <Card className={className}>
      <motion.div
        initial={false}
        animate={{
          height: hasActiveFilters ? "auto" : 48,
          backgroundColor: hasActiveFilters
            ? "var(--active-filter-bg)"
            : "var(--card-bg)",
        }}
        className="relative flex items-center gap-3 p-3 transition-colors"
      >
        <ScrollArea className="flex-1">
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {!hasActiveFilters ? (
                <motion.span
                  key="no-filters"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-2"
                >
                  <Search className="h-4 w-4 opacity-50" />
                  Sem filtros ativos
                </motion.span>
              ) : (
                <motion.div
                  key="active-filters"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-2"
                >
                  {search && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center"
                      layout
                    >
                      <FilterBadge
                        variant="secondary"
                        className={cn(
                          "gap-1.5 pl-2 pr-1 py-0.5 whitespace-nowrap group",
                          "bg-primary/5 hover:bg-primary/10 text-primary",
                          "border border-primary/10 hover:border-primary/20",
                          "transition-all duration-200"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <Search className="h-3 w-3 opacity-50" />
                          <span className="truncate max-w-[200px] text-sm">
                            {search}
                          </span>
                        </div>
                        <FilterButton
                          onClick={handleClearSearch}
                          className="group-hover:bg-primary/10"
                        >
                          <X className="h-3 w-3" />
                        </FilterButton>
                      </FilterBadge>
                    </motion.div>
                  )}
                  {selectedCategory && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      layout
                    >
                      <CategoryBadge
                        category={selectedCategory}
                        onRemove={() => handleCategoryChange(undefined)}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <FilterButton
              active={!!hasActiveFilters}
              className={cn(
                "h-8 w-8",
                hasActiveFilters &&
                  "bg-primary/5 hover:bg-primary/15 text-primary"
              )}
              aria-label="Filtros avançados"
            >
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </motion.div>
            </FilterButton>
          </SheetTrigger>
          <SheetContent
            side={isMobile ? "bottom" : "right"}
            className={cn(
              isMobile ? "h-[85vh]" : undefined,
              "backdrop-blur-xl bg-background/95"
            )}
          >
            <SheetHeader>
              <SheetTitle>Filtros avançados</SheetTitle>
              <SheetDescription>
                Refine sua busca usando os filtros abaixo
              </SheetDescription>
            </SheetHeader>
            <motion.div
              className="space-y-6 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Pesquisar</Label>
                <div className="relative group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  <Input
                    type="search"
                    placeholder="Pesquisar transações..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-8 transition-all border-muted-foreground/20 focus:border-primary/50 hover:border-primary/30"
                  />
                  {search && (
                    <FilterButton
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-3 w-3" />
                    </FilterButton>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Categoria</Label>
                <CategoryFilter
                  initialCategoryId={selectedCategoryId}
                  initialCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  insideSheet={true}
                />
              </div>
            </motion.div>
          </SheetContent>
        </Sheet>

        {/* Indicador de filtros ativos */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </Card>
  );
}

TransactionFilters.displayName = "TransactionFilters";
