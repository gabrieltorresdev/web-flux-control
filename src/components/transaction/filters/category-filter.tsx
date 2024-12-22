"use client";

import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { useCategories } from "@/src/hooks/use-categories";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useQueryParams } from "@/src/hooks/use-search-params";
import { TransactionFilters } from "@/src/types/filters";
import { useIsMobile } from "@/src/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { CategoryService } from "@/src/services/category-service";

interface CategoryFilterProps {
  initialCategoryId?: string;
}

const CategoryFilterSkeleton = React.memo(() => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-10 w-full" />
  </div>
));

CategoryFilterSkeleton.displayName = "CategoryFilterSkeleton";

const categoryService = new CategoryService();

export const CategoryFilter = React.memo(function CategoryFilter({
  initialCategoryId,
}: CategoryFilterProps) {
  const { setParam } = useQueryParams<TransactionFilters>();
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedId, setSelectedId] = React.useState(initialCategoryId);
  const isMobile = useIsMobile();

  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.findAllPaginated(),
    staleTime: Infinity, // Mantem o cache válido até uma mutação explícita
    gcTime: 24 * 60 * 60 * 1000, // 24 horas de cache
  });

  const categories = categoriesResponse?.data ?? [];

  // Filtra as categorias baseado no termo de busca
  const filteredCategories = React.useMemo(() => {
    if (!searchValue) return categories;

    const searchTerm = searchValue.toLowerCase();
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm)
    );
  }, [categories, searchValue]);

  // Encontra o nome da categoria selecionada
  const selectedCategory = React.useMemo(
    () => categories.find((category) => category.id === selectedId)?.name,
    [categories, selectedId]
  );

  const handleSelectCategory = React.useCallback(
    (categoryId: string | null) => {
      setSelectedId(categoryId ?? undefined);
      setParam("categoryId", categoryId);
      setOpen(false);
      setSearchValue("");
    },
    [setParam]
  );

  if (isLoading && !categories.length) {
    return <CategoryFilterSkeleton />;
  }

  const content = (
    <Command className="w-full">
      <CommandInput
        placeholder="Buscar categoria..."
        value={searchValue}
        onValueChange={setSearchValue}
        className="h-12 text-base"
      />
      <CommandEmpty className="py-6 text-center text-sm">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Carregando categorias...</span>
          </div>
        ) : (
          "Nenhuma categoria encontrada."
        )}
      </CommandEmpty>
      <CommandGroup className="max-h-[300px] overflow-auto">
        <CommandList>
          <CommandItem
            value="all"
            onSelect={() => handleSelectCategory(null)}
            className="py-3 text-base"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                !selectedId ? "opacity-100" : "opacity-0"
              )}
            />
            Todas as categorias
          </CommandItem>
          {filteredCategories.map((category) => (
            <CommandItem
              key={category.id}
              value={category.name}
              onSelect={() => handleSelectCategory(category.id)}
              className="py-3 text-base"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedId === category.id ? "opacity-100" : "opacity-0"
                )}
              />
              {category.name}
            </CommandItem>
          ))}
        </CommandList>
      </CommandGroup>
    </Command>
  );

  const trigger = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className={cn("w-full justify-between", isMobile && "h-12 text-base")}
    >
      {selectedCategory ?? "Todas as categorias"}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  return (
    <div className="space-y-1.5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Categoria</Label>
        {selectedId && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-muted-foreground"
            onClick={() => handleSelectCategory(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>Filtrar por Categoria</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{content}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="w-full p-0">{content}</PopoverContent>
        </Popover>
      )}
    </div>
  );
});

CategoryFilter.displayName = "CategoryFilter";
