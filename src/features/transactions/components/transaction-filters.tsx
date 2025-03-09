"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { CategoryFilter } from "./category-filter";
import { useQueryParams } from "@/shared/hooks/use-search-params";
import { TransactionFilters as TransactionFiltersType } from "@/features/transactions/types";
import { CategoryBadge } from "./category-badge";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Category } from "@/features/categories/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils";
import { FilterButton } from "./filter-button";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

interface TransactionFiltersProps {
  initialCategoryId?: string;
  initialCategory?: Category;
  initialSearch?: string;
  initialType?: 'income' | 'expense';
  className?: string;
}

// Componente reutilizável para o badge do filtro
const FilterBadge = motion.create(Badge);

export function TransactionFilters({
  initialCategoryId,
  initialCategory,
  initialSearch,
  initialType,
  className,
}: TransactionFiltersProps) {
  const { setParam } = useQueryParams<TransactionFiltersType>();
  const [search, setSearch] = React.useState(initialSearch ?? "");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState(initialCategoryId);
  const [selectedCategory, setSelectedCategory] = React.useState(initialCategory);
  const [selectedType, setSelectedType] = React.useState<'income' | 'expense' | undefined>(initialType);
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();
  
  // Ref para controlar os timeouts de debounce
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Função para limpar todos os filtros simultaneamente
  const clearAllFilters = React.useCallback(() => {
    // Primeiro limpar os estados locais
    setSearch("");
    setSelectedCategoryId(undefined);
    setSelectedCategory(undefined);
    setSelectedType(undefined);
    
    // Em seguida, limpar os parâmetros de URL de uma vez só
    // usando o objeto de parâmetros atual e removendo os filtros
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.delete("search");
    currentParams.delete("categoryId");
    currentParams.delete("type");
    
    // Atualizar a URL com todos os parâmetros removidos de uma só vez
    window.history.replaceState(
      {}, 
      "", 
      `${window.location.pathname}${
        currentParams.toString() ? `?${currentParams.toString()}` : ""
      }`
    );
    
    // Forçar um reload dos dados
    window.dispatchEvent(new Event('popstate'));
  }, []);

  const updateSearch = React.useCallback(
    (value: string) => {
      // Limpar o timeout anterior se existir
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Debounce para evitar muitas chamadas
      searchTimeoutRef.current = setTimeout(() => {
        if (value) {
          setParam("search", value);
        } else {
          setParam("search", null);
        }
      }, 500);
    },
    [setParam]
  );

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);
      updateSearch(value);
    },
    [updateSearch]
  );

  const handleClearSearch = React.useCallback(() => {
    setSearch("");
    setParam("search", null);
  }, [setParam]);

  const handleCategoryChange = React.useCallback(
    (categoryId: string | undefined, category?: Category) => {
      setSelectedCategoryId(categoryId);
      setSelectedCategory(category);
      setParam("categoryId", categoryId ?? null);
    },
    [setParam]
  );
  
  const handleTypeChange = React.useCallback(
    (type: 'income' | 'expense' | undefined) => {
      setSelectedType(type);
      setParam("type", type ?? null);
      
      // Reset category if current category is not of the selected type
      if (type && selectedCategory && selectedCategory.type !== type) {
        handleCategoryChange(undefined);
      }
    },
    [setParam, selectedCategory, handleCategoryChange]
  );

  // Effect para sincronizar os estados dos filtros com props iniciais
  React.useEffect(() => {
    setSelectedCategoryId(initialCategoryId);
    setSelectedCategory(initialCategory);
    setSelectedType(initialType);
  }, [initialCategoryId, initialCategory, initialType]);

  // Effect para atualizar a pesquisa quando o valor muda
  React.useEffect(() => {
    updateSearch(search);
    
    // Cleanup para evitar vazamento de memória
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, updateSearch]);

  const hasActiveFilters = search || selectedCategoryId || selectedType;
  const activeFilterCount = (search ? 1 : 0) + (selectedCategoryId ? 1 : 0) + (selectedType ? 1 : 0);

  const renderFilters = () => (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <Label className="text-sm font-medium text-foreground/80">Tipo de transação</Label>
        <RadioGroup 
          value={selectedType || ""} 
          onValueChange={(value: string) => {
            if (value === "income") {
              handleTypeChange("income");
            } else if (value === "expense") {
              handleTypeChange("expense");
            } else {
              handleTypeChange(undefined);
            }
          }}
          className="space-y-1.5"
        >
          <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/30 transition-colors cursor-pointer">
            <RadioGroupItem value="income" id="income" className="border-input" />
            <Label htmlFor="income" className="flex items-center gap-2 cursor-pointer text-sm font-normal">
              <ArrowUpRight className="h-3.5 w-3.5 text-success" />
              <span>Entradas</span>
            </Label>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/30 transition-colors cursor-pointer">
            <RadioGroupItem value="expense" id="expense" className="border-input" />
            <Label htmlFor="expense" className="flex items-center gap-2 cursor-pointer text-sm font-normal">
              <ArrowDownRight className="h-3.5 w-3.5 text-expense" />
              <span>Saídas</span>
            </Label>
          </div>
        </RadioGroup>
        {selectedType && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground h-7 px-2 -ml-2"
            onClick={() => handleTypeChange(undefined)}
          >
            <X className="h-3 w-3 mr-1.5" />
            Limpar
          </Button>
        )}
      </div>
      
      <Separator className="bg-border/50" />
      
      <div className="space-y-2.5">
        <Label className="text-sm font-medium text-foreground/80">Categoria</Label>
        <CategoryFilter
          initialCategoryId={selectedCategoryId}
          initialCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          insideSheet={isMobile}
          type={selectedType}
        />
      </div>
    </div>
  );

  const renderFilterTrigger = () => {
    if (isMobile) {
      return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <div className="relative">
              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  "h-9 w-9 border-input/70 shrink-0",
                  hasActiveFilters && "text-primary border-primary/30"
                )}
              >
                <Filter className="h-4 w-4" />
              </Button>
              {activeFilterCount > 0 && (
                <Badge 
                  className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 flex items-center justify-center rounded-full text-[10px] font-medium bg-primary text-primary-foreground"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </div>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="w-full p-0"
          >
            <div className="flex flex-col h-full">
              <SheetHeader className="px-5 pt-5 pb-2">
                <SheetTitle className="text-lg font-medium">Filtros</SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  Refine sua busca usando os filtros abaixo
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 px-5 py-3 overflow-y-auto">
                {renderFilters()}
              </div>
              
              <div className="p-3 border-t border-border/50 flex justify-between">
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => {
                    clearAllFilters();
                    setIsOpen(false);
                  }}
                  disabled={!hasActiveFilters}
                  className="text-sm h-9 border-input/70"
                >
                  Limpar filtros
                </Button>
                <Button 
                  onClick={() => setIsOpen(false)}
                  size="sm"
                  className="text-sm h-9"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      );
    }
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative">
            <Button 
              variant="outline" 
              size="icon" 
              className={cn(
                "h-9 w-9 border-input/70 shrink-0",
                hasActiveFilters && "text-primary border-primary/30"
              )}
            >
              <Filter className="h-4 w-4" />
            </Button>
            {activeFilterCount > 0 && (
              <Badge 
                className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 flex items-center justify-center rounded-full text-[10px] font-medium bg-primary text-primary-foreground"
              >
                {activeFilterCount}
              </Badge>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-4 shadow-md border-border/70">
          {renderFilters()}
          {hasActiveFilters && (
            <>
              <Separator className="my-3 bg-border/50" />
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-xs h-8 border-input/70"
                >
                  Limpar todos os filtros
                </Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Card className={cn("border-border/70 shadow-sm p-3", className)}>
      <div className="flex w-full items-center gap-2 p-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <Input
            type="search"
            placeholder="Pesquisar transações..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9 h-9 bg-background border-input/60 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-muted/50"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        
        {renderFilterTrigger()}
      </div>
    </Card>
  );
}

TransactionFilters.displayName = "TransactionFilters";
