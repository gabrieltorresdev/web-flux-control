"use client";

import { useDebounce } from "@/src/hooks/lib/use-debounce";
import { CategoryService } from "@/src/services/category-service";
import { Category } from "@/src/types/category";
import { CreateTransactionInput } from "@/src/types/transaction";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { Input } from "../../ui/input";
import {
  ArrowUpDown,
  Check,
  ChevronsUpDown,
  CircleDollarSign,
  Loader2,
  Plus,
  Tag,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { CreateCategoryDialog } from "../../category/create-category-dialog";
import { DateTimePicker } from "../../ui/date-time-picker";
import { useIsMobile } from "@/src/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";

interface TransactionFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  register: UseFormRegister<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
  getValues: UseFormGetValues<CreateTransactionInput>;
  setValue: UseFormSetValue<CreateTransactionInput>;
  suggestedCategory?: string;
  onCreateCategory?: (name: string) => void;
  isSubmitting?: boolean;
}

const categoryService = new CategoryService();

export const TransactionForm = memo(
  ({
    onSubmit,
    register,
    errors,
    getValues,
    suggestedCategory,
    onCreateCategory,
    setValue,
    isSubmitting = false,
  }: TransactionFormProps) => {
    const [formState, setFormState] = useState({
      open: false,
      searchTerm: "",
      selectedCategory: "",
      isSearching: false,
      showCreateDialog: false,
      isVisible: false,
      submitSuccess: false,
    });

    const isMobile = useIsMobile();
    const formRef = useRef<HTMLFormElement>(null);
    const queryClient = useQueryClient();
    const debouncedSearchTerm = useDebounce(formState.searchTerm, 500);

    const handleVisibilityChange = useCallback(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFormState((prev) => ({ ...prev, isVisible: true }));
          }
        });
      },
      []
    );

    useEffect(() => {
      const observer = new IntersectionObserver(handleVisibilityChange, {
        threshold: 0.1,
      });
      const currentFormRef = formRef.current;

      if (currentFormRef) {
        observer.observe(currentFormRef);
        return () => observer.unobserve(currentFormRef);
      }
    }, [handleVisibilityChange]);

    const {
      data: categoriesResponse,
      isLoading,
      isError,
      refetch,
    } = useQuery({
      queryKey: ["categories", debouncedSearchTerm],
      queryFn: async () => {
        setFormState((prev) => ({ ...prev, isSearching: true }));
        try {
          return await categoryService.findAllPaginated(debouncedSearchTerm);
        } finally {
          setFormState((prev) => ({ ...prev, isSearching: false }));
        }
      },
      enabled:
        formState.isVisible || formState.open || !!getValues("categoryId"),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });

    const categories = useMemo(
      () => categoriesResponse?.data ?? [],
      [categoriesResponse]
    );

    const showLoading = isLoading || formState.isSearching;

    useEffect(() => {
      const categoryId = getValues("categoryId");
      if (categoryId) {
        const category = categories.find(
          (cat: Category) => cat.id === categoryId
        );
        if (category) {
          setFormState((prev) => ({
            ...prev,
            selectedCategory: category.name,
          }));
        }
      }
    }, [categories, getValues]);

    const handleCategoryCreated = useCallback(
      (categoryId: string, categoryName: string) => {
        setFormState((prev) => ({
          ...prev,
          selectedCategory: categoryName,
          open: false,
        }));
        setValue("categoryId", categoryId);
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      },
      [setValue, queryClient]
    );

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        setFormState((prev) => ({
          ...prev,
          isSubmitting: true,
          submitSuccess: false,
        }));

        try {
          await onSubmit(e);
          if (Object.keys(errors).length === 0) {
            setFormState((prev) => ({ ...prev, submitSuccess: true }));
            setTimeout(() => {
              setFormState((prev) => ({
                ...prev,
                isSubmitting: false,
                submitSuccess: false,
              }));
            }, 1000);
          } else {
            setFormState((prev) => ({ ...prev, isSubmitting: false }));
          }
        } catch {
          setFormState((prev) => ({ ...prev, isSubmitting: false }));
        }
      },
      [onSubmit, errors]
    );

    const handleSearchChange = useCallback((value: string) => {
      setFormState((prev) => ({ ...prev, searchTerm: value }));
    }, []);

    const handleCategorySelect = useCallback(
      (categoryId: string, categoryName: string) => {
        setFormState((prev) => ({
          ...prev,
          selectedCategory: categoryName,
          open: false,
        }));
        setValue("categoryId", categoryId);
      },
      [setValue]
    );

    const CategorySelector = () => {
      const content = (
        <Command shouldFilter={false} className="w-full">
          <CommandItem
            onSelect={() =>
              setFormState((prev) => ({
                ...prev,
                showCreateDialog: true,
              }))
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
            {showLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <p className="text-sm text-muted-foreground">
                  Erro ao carregar categorias
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <>
                {categories?.length > 0 &&
                  categories.map((category: Category) => (
                    <CommandItem
                      key={category.id}
                      value={category.id}
                      onSelect={(value) =>
                        handleCategorySelect(value, category.name)
                      }
                      className="py-3"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formState.selectedCategory !== category.name &&
                            "hidden"
                        )}
                      />
                      {category.name}
                    </CommandItem>
                  ))}
              </>
            )}
          </CommandList>
        </Command>
      );

      if (isMobile) {
        return (
          <Sheet
            open={formState.open}
            onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
          >
            <SheetTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={formState.open}
                className="w-full justify-between h-12"
              >
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {formState.selectedCategory || "Selecione uma categoria"}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh]">
              <SheetHeader>
                <SheetTitle>Selecionar Categoria</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{content}</div>
            </SheetContent>
          </Sheet>
        );
      }

      return (
        <Popover
          open={formState.open}
          onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={formState.open}
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {formState.selectedCategory || "Selecione uma categoria"}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">{content}</PopoverContent>
        </Popover>
      );
    };

    return (
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Título</label>
          <div className="relative">
            <CircleDollarSign className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              {...register("title")}
              className="pl-10 h-12 text-base"
              placeholder="Ex: Compras no Mercado"
            />
          </div>
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Valor</label>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              {...register("amount", { valueAsNumber: true })}
              type="number"
              inputMode="decimal"
              step="0.01"
              className="pl-10 h-12 text-base"
              placeholder="0.00"
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoria</label>
          <CategorySelector />
          {errors.categoryId && (
            <p className="text-sm text-red-500">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Suggested Category */}
        {suggestedCategory && (
          <div className="mt-2 rounded-md bg-muted p-4">
            <div className="flex gap-2 items-center justify-between text-sm text-muted-foreground">
              <p>
                Categoria sugerida pela IA: <strong>{suggestedCategory}</strong>
              </p>
              {!categories.some(
                (category: Category) => category.name === suggestedCategory
              ) ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onCreateCategory?.(suggestedCategory);
                    setFormState((prev) => ({
                      ...prev,
                      showCreateDialog: true,
                    }));
                  }}
                >
                  Criar categoria
                </Button>
              ) : (
                <Check className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        )}

        {/* Date Time Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Data e Hora</label>
          <DateTimePicker
            value={getValues("dateTime")}
            onChange={(date) => setValue("dateTime", date || new Date())}
          />
          {errors.dateTime && (
            <p className="text-sm text-red-500">{errors.dateTime.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Salvar Transação"
          )}
        </Button>

        {/* Create Category Dialog */}
        <CreateCategoryDialog
          open={formState.showCreateDialog}
          onOpenChange={(open) =>
            setFormState((prev) => ({ ...prev, showCreateDialog: open }))
          }
          onSuccess={handleCategoryCreated}
          defaultCategoryName={suggestedCategory}
        />
      </form>
    );
  }
);

TransactionForm.displayName = "TransactionForm";
