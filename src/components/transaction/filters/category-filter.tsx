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
    <Command shouldFilter={false} className="w-full relative">
      <div className="sticky top-0 left-0 right-0 bg-popover z-10 border-b">
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
      </div>
      <div className="overflow-y-auto">
        <CommandList className="max-h-none">
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
      </div>
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
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle className="text-lg font-semibold">
                Selecione uma categoria
              </SheetTitle>
              <SheetDescription />
            </SheetHeader>

            <Command shouldFilter={false} className="w-full h-full">
              <div className="sticky top-0 left-0 right-0 bg-background z-10 px-4 py-2 border-b">
                <CommandInput
                  placeholder="Buscar categoria..."
                  value={formState.searchTerm}
                  onValueChange={handleSearchChange}
                  className="h-12 bg-muted"
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-2">
                  <CommandItem
                    onSelect={() =>
                      setFormState((prev) => ({
                        ...prev,
                        showCreateDialog: true,
                      }))
                    }
                    className="mx-2 my-2 h-12 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    <span className="font-medium">Criar nova categoria</span>
                  </CommandItem>

                  <CommandList>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <div className="px-2 py-2">
                          <CommandItem
                            value="all"
                            onSelect={() => handleSelectCategory(null)}
                            className="rounded-md h-12"
                          >
                            <div className="flex items-center gap-2">
                              <Check
                                className={cn(
                                  "h-5 w-5",
                                  !formState.selectedId
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="font-medium">
                                Todas as categorias
                              </span>
                            </div>
                          </CommandItem>
                        </div>

                        {filteredCategories?.length > 0 && (
                          <div className="px-2 py-2">
                            {filteredCategories.map((category) => (
                              <CommandItem
                                key={category.id}
                                value={category.id}
                                onSelect={(value) =>
                                  handleSelectCategory(value)
                                }
                                className="rounded-md h-12"
                              >
                                <div className="flex items-center w-full gap-3">
                                  <CategorySelectItem category={category} />
                                  {formState.selectedId === category.id && (
                                    <Check className="ml-auto h-5 w-5 text-primary" />
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </div>
                        )}

                        {filteredCategories?.length === 0 && (
                          <div className="flex flex-col items-center gap-2 py-8">
                            <p className="text-base text-muted-foreground">
                              Nenhuma categoria encontrada
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </CommandList>
                </div>
              </div>
            </Command>
          </div>
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
