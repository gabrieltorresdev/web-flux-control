"use client";

import { memo, useState, useCallback, useMemo } from "react";
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
import { CategorySelectItem } from "./category-select-item";
import { useDebounce } from "@/hooks/lib/use-debounce";
import {
  useCategoryStore,
  createCategoryStore,
  createCategorySelectors,
} from "@/stores/category-store";
import { Category } from "@/types/category";
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
  onCategoryCreated?: () => Promise<void>;
  showAllOption?: boolean;
  store?: ReturnType<typeof createCategoryStore>;
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
    if (!debouncedSearchTerm) return categories;
    return categories.filter((cat: Category) =>
      cat.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [categories, debouncedSearchTerm]);

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
        await onCategoryCreated();
      }
    },
    [onChange, onCategoryCreated, categories]
  );

  const content = (
    <Command shouldFilter={false} className="w-full">
      <div className="sticky top-0 left-0 right-0 bg-background z-10">
        <CommandItem
          onSelect={handleCreateCategory}
          className="border-b text-primary rounded-none cursor-pointer hover:bg-muted"
        >
          <Plus className="mr-2 h-4 w-4" />
          Criar nova categoria
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
        "w-full justify-between h-12 text-base",
        showAsBadge && "w-40",
        error && "border-destructive text-destructive",
        className
      )}
    >
      {selectedCategory ? (
        <CategorySelectItem category={selectedCategory} showType={false} />
      ) : (
        placeholder
      )}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  if (isMobile && !insideSheet) {
    return (
      <>
        <Sheet open={state.open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] p-0">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle className="text-lg font-semibold">
                Selecione uma categoria
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
          defaultCategoryName={state.searchTerm}
        />
      </>
    );
  }

  return (
    <>
      <Popover open={state.open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          {content}
        </PopoverContent>
      </Popover>

      <CreateCategoryDialog
        open={state.showCreateDialog}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, showCreateDialog: open }))
        }
        onSuccess={handleCreateSuccess}
        defaultCategoryName={state.searchTerm}
      />
    </>
  );
});
