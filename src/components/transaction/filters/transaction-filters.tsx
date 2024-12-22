"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { CategoryFilter } from "./category-filter";
import { Input } from "@/src/components/ui/input";
import { useQueryParams } from "@/src/hooks/use-search-params";
import type { TransactionFilters as TransactionFiltersType } from "@/src/types/filters";
import { useDebounce } from "@/src/hooks/use-debounce";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Card } from "../../ui/card";
import { Label } from "../../ui/label";

interface TransactionFiltersProps {
  initialCategoryId?: string;
  initialSearch?: string;
}

export function TransactionFilters({
  initialCategoryId,
  initialSearch,
}: TransactionFiltersProps) {
  const { setParam } = useQueryParams<TransactionFiltersType>();
  const [search, setSearch] = React.useState(initialSearch ?? "");

  // Inicializa aberto se houver filtros aplicados
  const [isOpen, setIsOpen] = React.useState(
    !!(initialSearch || initialCategoryId)
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

  // Debounce search to avoid too many requests
  useDebounce(updateSearch, 500, [search]);

  // Abre o accordion quando filtros são aplicados
  React.useEffect(() => {
    if (search || initialCategoryId) {
      setIsOpen(true);
    }
  }, [search, initialCategoryId]);

  return (
    <Card>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={isOpen ? "filters" : ""}
        onValueChange={(value) => setIsOpen(!!value)}
      >
        <AccordionItem value="filters" className="border-none">
          <AccordionTrigger
            className={cn(
              "py-1.5 px-3 -mx-3 rounded-full text-sm transition-colors",
              "hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/50",
              "flex items-center gap-2 justify-center"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="text-muted-foreground">Filtros avançados</span>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <div className="p-3 md:p-6 gap-3 grid grid-cols-1 md:grid-cols-2">
              <div className="space-y-1.5 flex flex-col justify-between">
                <Label className="text-xs">Pesquisar</Label>

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
              <CategoryFilter initialCategoryId={initialCategoryId} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

TransactionFilters.displayName = "TransactionFilters";
