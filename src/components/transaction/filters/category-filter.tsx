"use client";

import { memo, useState, useEffect, useMemo, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CategorySelectItem } from "../../category/category-select-item";
import { useDebounce } from "@/hooks/lib/use-debounce";
import { useCategories } from "@/hooks/use-categories";

interface CategoryFilterProps {
  initialCategoryId?: string;
  showAsBadge?: boolean;
  onCategoryChange?: (categoryId: string | undefined) => void;
}

export const CategoryFilter = memo(function CategoryFilter({
  initialCategoryId,
  showAsBadge = false,
  onCategoryChange,
}: CategoryFilterProps) {
  const [formState, setFormState] = useState({
    open: false,
    searchTerm: "",
    selectedId: initialCategoryId,
  });

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      selectedId: initialCategoryId,
    }));
  }, [initialCategoryId]);

  const isMobile = useIsMobile();
  const debouncedSearchTerm = useDebounce(formState.searchTerm, 500);
  const { data, isLoading } = useCategories(debouncedSearchTerm);
  const categories = data?.data ?? [];

  const filteredCategories = useMemo(() => {
    if (!formState.searchTerm) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(formState.searchTerm.toLowerCase())
    );
  }, [categories, formState.searchTerm]);

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id === formState.selectedId),
    [categories, formState.selectedId]
  );

  const handleSearchChange = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, searchTerm: value }));
  }, []);

  const handleSelectCategory = useCallback(
    (categoryId: string | null) => {
      setFormState((prev) => ({
        ...prev,
        selectedId: categoryId ?? undefined,
        open: false,
        searchTerm: "",
      }));
      onCategoryChange?.(categoryId ?? undefined);
    },
    [onCategoryChange]
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setFormState((prev) => ({ ...prev, open }));
  }, []);

  const content = (
    <Command shouldFilter={false} className="w-full">
      <CommandItem
        onSelect={() =>
          setFormState((prev) => ({ ...prev, showCreateDialog: true }))
        }
        className="border-b text-blue-500 rounded-none cursor-pointer"
      >
        <Plus className="mr-2 h-4 w-4" />
        Criar nova categoria
      </CommandItem>
      <CommandInput
        placeholder="Buscar categoria..."
        value={formState.searchTerm}
        onValueChange={handleSearchChange}
        className="h-12"
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
            {filteredCategories?.length > 0 &&
              filteredCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.id}
                  onSelect={(value) => handleSelectCategory(value)}
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
            {filteredCategories?.length === 0 && (
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
  );

  const trigger = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={formState.open}
      className={cn(
        "w-full justify-between h-12 text-base",
        showAsBadge && "w-40"
      )}
    >
      {selectedCategory ? (
        <CategorySelectItem category={selectedCategory} showType={false} />
      ) : (
        "Selecione uma categoria"
      )}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  if (isMobile) {
    return (
      <Sheet open={formState.open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="h-[400px] p-3">
          <SheetHeader>
            <SheetTitle className="text-base">
              Selecione uma categoria
            </SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={formState.open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        {content}
      </PopoverContent>
    </Popover>
  );
});

CategoryFilter.displayName = "CategoryFilter";
