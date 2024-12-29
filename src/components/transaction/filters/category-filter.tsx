"use client";

import * as React from "react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
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
import { CategorySelectItem } from "../../category/category-select-item";
import { Category } from "@/src/types/category";
import { useDebounce } from "@/src/hooks/lib/use-debounce";
import { Badge } from "@/src/components/ui/badge";

interface CategoryFilterProps {
  initialCategoryId?: string;
  showAsBadge?: boolean;
  onCategoryChange?: (categoryId: string | undefined) => void;
}

const categoryService = new CategoryService();

export const CategoryFilter = React.memo(function CategoryFilter({
  initialCategoryId,
  showAsBadge = false,
  onCategoryChange,
}: CategoryFilterProps) {
  const { setParam } = useQueryParams<TransactionFilters>();
  const [formState, setFormState] = React.useState({
    open: false,
    searchTerm: "",
    selectedId: initialCategoryId,
  });

  React.useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      selectedId: initialCategoryId,
    }));
  }, [initialCategoryId]);

  const isMobile = useIsMobile();
  const debouncedSearchTerm = useDebounce(formState.searchTerm, 500);

  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ["categories", debouncedSearchTerm],
    queryFn: async () => {
      return await categoryService.findAllPaginated(debouncedSearchTerm);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const categories = React.useMemo(
    () => categoriesResponse?.data ?? [],
    [categoriesResponse]
  );

  const selectedCategoryData = React.useMemo(
    () => categories.find((category) => category.id === formState.selectedId),
    [categories, formState.selectedId]
  );

  const handleSearchChange = React.useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, searchTerm: value }));
  }, []);

  const handleSelectCategory = React.useCallback(
    (categoryId: string | null) => {
      setFormState((prev) => ({
        ...prev,
        selectedId: categoryId ?? undefined,
        open: false,
        searchTerm: "",
      }));
      setParam("categoryId", categoryId);
      onCategoryChange?.(categoryId ?? undefined);
    },
    [setParam, onCategoryChange]
  );

  const handleOpenChange = React.useCallback((open: boolean) => {
    setFormState((prev) => ({ ...prev, open }));
  }, []);

  const content = React.useMemo(
    () => (
      <Command className="w-full">
        <CommandInput
          placeholder="Buscar categoria..."
          value={formState.searchTerm}
          onValueChange={handleSearchChange}
          className="h-12 text-base"
        />
        <CommandList className="max-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <>
              <CommandItem
                value="all"
                onSelect={() => handleSelectCategory(null)}
                className="py-3 text-base"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !formState.selectedId ? "opacity-100" : "opacity-0"
                  )}
                />
                Todas as categorias
              </CommandItem>
              {categories?.length > 0 &&
                categories.map((category: Category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => handleSelectCategory(category.id)}
                    className="py-2"
                  >
                    <div className="flex items-center w-full">
                      <CategorySelectItem category={category} />
                      {formState.selectedId === category.id && (
                        <Check className="ml-auto h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              {categories?.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-4">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma categoria encontrada
                  </p>
                </div>
              )}
            </>
          )}
        </CommandList>
      </Command>
    ),
    [
      categories,
      formState.searchTerm,
      formState.selectedId,
      handleSearchChange,
      handleSelectCategory,
      isLoading,
    ]
  );

  const trigger = React.useMemo(
    () => (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={formState.open}
        className={cn("w-full justify-between", isMobile && "h-12 text-base")}
      >
        {selectedCategoryData ? (
          <CategorySelectItem
            category={selectedCategoryData}
            showType={false}
          />
        ) : (
          "Todas as categorias"
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    ),
    [formState.open, isMobile, selectedCategoryData]
  );

  if (showAsBadge && selectedCategoryData) {
    return (
      <Badge variant="secondary" className="gap-1 whitespace-nowrap">
        <CategorySelectItem
          category={selectedCategoryData}
          showType={false}
          compact
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={() => handleSelectCategory(null)}
        >
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    );
  }

  return (
    <div className="space-y-1.5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Categoria</Label>
        {formState.selectedId && (
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
        <Sheet open={formState.open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>Filtrar por Categoria</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{content}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover open={formState.open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="w-full p-0">{content}</PopoverContent>
        </Popover>
      )}
    </div>
  );
});

CategoryFilter.displayName = "CategoryFilter";
