"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { CategorySelectItem } from "./category-select-item";
import { useDebounce } from "@/shared/hooks/use-debounce";
import {
  useCategoryStore,
  createCategoryStore,
  createCategorySelectors,
} from "@/features/categories/stores/category-store";
import { Category } from "@/features/categories/types";
import { CreateCategoryDialog } from "./create-category-dialog";

interface CategorySelectorProps {
  value?: string;
  selectedCategory?: Category;
  onChange?: (value: string | undefined, category?: Category) => void;
  placeholder?: string;
  showAsBadge?: boolean;
  className?: string;
  error?: boolean;
  insideSheet?: boolean;
  onCategoryCreated?: (categoryId?: string, categoryName?: string) => Promise<void>;
  showAllOption?: boolean;
  store?: ReturnType<typeof createCategoryStore>;
  filterByType?: 'income' | 'expense';
}

export const CategorySelector = memo(function CategorySelector({
  value,
  selectedCategory,
  onChange,
  placeholder = "Selecione uma categoria",
  showAsBadge = false,
  className,
  error,
  insideSheet = false,
  onCategoryCreated,
  showAllOption = false,
  store = useCategoryStore,
  filterByType,
}: CategorySelectorProps) {
  const [state, setState] = useState({
    open: false,
    searchTerm: "",
    showCreateDialog: false,
  });

  const isMobile = useIsMobile();
  const debouncedSearchTerm = useDebounce(state.searchTerm, 500);

  // Use store selectors
  const useStoreSelectors = useMemo(
    () => createCategorySelectors(store),
    [store]
  );
  const { categories, isLoading } = useStoreSelectors();

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    // First filter by type if filterByType is provided
    const typeFilteredCategories = filterByType 
      ? categories.filter(cat => cat.type === filterByType)
      : categories;
    
    // Then filter by search term if provided
    if (!debouncedSearchTerm) {
      // Sort categories with default categories first
      return [...typeFilteredCategories].sort((a, b) => {
        if (a.isDefault === b.isDefault) return 0;
        return a.isDefault ? -1 : 1;
      });
    }
    
    return typeFilteredCategories
      .filter((cat: Category) =>
        cat.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (a.isDefault === b.isDefault) return 0;
        return a.isDefault ? -1 : 1;
      });
  }, [categories, debouncedSearchTerm, filterByType]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setState((prev) => ({ ...prev, open }));
      if (open) {
        // Força o recarregamento das categorias quando o seletor é aberto
        store.getState().forceReload();
      }
    },
    [store]
  );

  const handleSearchChange = useCallback((value: string) => {
    setState((prev) => ({ ...prev, searchTerm: value }));
  }, []);

  const handleSelect = useCallback(
    (categoryId: string | null) => {
      setState((prev) => ({
        ...prev,
        open: false,
        searchTerm: "",
      }));
      if (categoryId === null) {
        onChange?.(undefined, undefined);
      } else {
        const category = categories.find((cat) => cat.id === categoryId);
        onChange?.(categoryId, category);
      }
    },
    [onChange, categories]
  );

  const handleCreateCategory = useCallback(() => {
    setState((prev) => ({ ...prev, showCreateDialog: true }));
  }, []);

  const handleCreateSuccess = useCallback(
    async (categoryId: string) => {
      setState((prev) => ({ ...prev, showCreateDialog: false }));
      const category = categories.find((cat) => cat.id === categoryId);
      onChange?.(categoryId, category);
      if (onCategoryCreated) {
        await onCategoryCreated(categoryId, category?.name);
      }
    },
    [onChange, onCategoryCreated, categories]
  );

  // Update placeholder if category type filter is applied
  const typeFilterPlaceholder = filterByType === 'income' 
    ? 'Selecione categoria de entrada' 
    : filterByType === 'expense'
      ? 'Selecione categoria de saída'
      : placeholder;

  const content = (
    <Command shouldFilter={false} className="w-full">
      <div className="sticky top-0 left-0 right-0 bg-background z-10">
        <CommandItem
          onSelect={handleCreateCategory}
          className="border-b text-primary rounded-none cursor-pointer hover:bg-muted"
        >
          <Plus className="mr-2 h-4 w-4" />
          Criar nova categoria
          {filterByType && (
            <span className="ml-1 text-xs opacity-70">
              ({filterByType === 'income' ? 'entrada' : 'saída'})
            </span>
          )}
        </CommandItem>
        <CommandInput
          placeholder="Buscar categoria..."
          value={state.searchTerm}
          onValueChange={handleSearchChange}
          className="h-12 border-none focus:ring-0"
        />
      </div>
      <CommandList
        className={cn("max-h-[300px]", insideSheet && "max-h-[50vh]")}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {showAllOption && (
              <CommandItem
                value="all"
                onSelect={() => handleSelect(null)}
                className="py-3 text-base"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
                Todas as categorias
                {filterByType && (
                  <span className="ml-1 text-xs opacity-70">
                    ({filterByType === 'income' ? 'entradas' : 'saídas'})
                  </span>
                )}
              </CommandItem>
            )}
            {filteredCategories?.length > 0 &&
              filteredCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.id}
                  onSelect={(value) => handleSelect(value)}
                  className="py-2"
                >
                  <div className="flex items-center w-full">
                    <CategorySelectItem category={category} />
                    {value === category.id && (
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
      aria-expanded={state.open}
      className={cn(
        "w-full justify-between h-10 text-base",
        showAsBadge && "w-40",
        error && "border-destructive text-destructive",
        className
      )}
    >
      {selectedCategory ? (
        <CategorySelectItem category={selectedCategory} showType={false} />
      ) : (
        typeFilterPlaceholder
      )}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  if (isMobile || insideSheet) {
    return (
      <>
        <Sheet open={state.open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent side="bottom" className="p-0">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle className="text-lg font-semibold">
                Selecione uma categoria
                {filterByType && (
                  <span className="text-sm font-normal ml-1 opacity-70">
                    ({filterByType === 'income' ? 'entrada' : 'saída'})
                  </span>
                )}
              </SheetTitle>
              <SheetDescription />
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>

        <CreateCategoryDialog
          open={state.showCreateDialog}
          onOpenChange={(open) =>
            setState((prev) => ({ ...prev, showCreateDialog: open }))
          }
          onSuccess={handleCreateSuccess}
          defaultType={filterByType}
        />
      </>
    );
  }

  return (
    <>
      <Popover open={state.open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          {content}
        </PopoverContent>
      </Popover>

      <CreateCategoryDialog
        open={state.showCreateDialog}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, showCreateDialog: open }))
        }
        onSuccess={handleCreateSuccess}
        defaultType={filterByType}
      />
    </>
  );
});
