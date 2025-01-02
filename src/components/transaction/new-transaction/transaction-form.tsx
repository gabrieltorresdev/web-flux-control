"use client";

import { memo, useCallback, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CircleDollarSign,
  ArrowUpDown,
  Plus,
  Check,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { CreateTransactionInput } from "@/types/transaction";
import {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetError,
  UseFormSetValue,
} from "react-hook-form";
import { CreateCategoryDialog } from "@/components/category/create-category-dialog";
import { CategorySelectItem } from "../../category/category-select-item";
import { ValidationError } from "@/lib/api/error-handler";
import { Category } from "@/types/category";
import { useDebounce } from "@/hooks/lib/use-debounce";
import { getCategories } from "@/app/actions/categories";
import { useEffect, useState as useReactState } from "react";
import { ApiPaginatedResponse } from "@/types/service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TransactionFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  register: UseFormRegister<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
  getValues: UseFormGetValues<CreateTransactionInput>;
  setValue: UseFormSetValue<CreateTransactionInput>;
  setError: UseFormSetError<CreateTransactionInput>;
  suggestedCategory?: string;
  onCreateCategory?: (name: string) => void;
  isSubmitting?: boolean;
}

interface CategorySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCategorySelect: (categoryId: string, categoryName: string) => void;
  onCreateCategory: () => void;
  getValues: UseFormGetValues<CreateTransactionInput>;
  setValue: UseFormSetValue<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
}

function useCategoriesData() {
  const [state, setState] = useReactState<{
    data: ApiPaginatedResponse<Category[]> | null;
    searchData: ApiPaginatedResponse<Category[]> | null;
    isLoading: boolean;
    searchTerm?: string;
  }>({
    data: null,
    searchData: null,
    isLoading: false,
    searchTerm: undefined,
  });

  // Fetch initial data only once
  useEffect(() => {
    let ignore = false;
    setState((prev) => ({ ...prev, isLoading: true }));

    async function fetchInitialData() {
      try {
        const result = await getCategories();
        if (!ignore) {
          setState((prev) => ({
            ...prev,
            data: result,
            searchData: result,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        if (!ignore) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    }

    fetchInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  // Search data when searchTerm changes
  const search = useCallback(async (term?: string) => {
    if (!term) {
      setState((prev) => ({
        ...prev,
        searchData: prev.data,
        searchTerm: undefined,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, searchTerm: term }));

    try {
      const result = await getCategories(term);
      setState((prev) => ({
        ...prev,
        searchData: result,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error searching categories:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  return {
    data: state.data?.data ?? [],
    searchData: state.searchData?.data ?? [],
    isLoading: state.isLoading,
    search,
  };
}

function CategoryList({
  onCategorySelect,
  getValues,
  categories,
  isLoading,
}: {
  onCategorySelect: (categoryId: string, categoryName: string) => void;
  getValues: UseFormGetValues<CreateTransactionInput>;
  categories: Category[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <p className="text-sm text-muted-foreground">
          Nenhuma categoria encontrada
        </p>
      </div>
    );
  }

  return (
    <>
      {categories.map((category: Category) => (
        <CommandItem
          key={category.id}
          value={category.id}
          onSelect={(value) => onCategorySelect(value, category.name)}
          className="py-2"
        >
          <CategorySelectItem category={category} />
          {getValues("categoryId") === category.id && (
            <Check className="ml-auto h-4 w-4 opacity-50" />
          )}
        </CommandItem>
      ))}
    </>
  );
}

function CategorySelectorContent({
  searchTerm,
  onSearchChange,
  onCategorySelect,
  onCreateCategory,
  getValues,
  categories,
  isLoading,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCategorySelect: (categoryId: string, categoryName: string) => void;
  onCreateCategory: () => void;
  getValues: UseFormGetValues<CreateTransactionInput>;
  categories: Category[];
  isLoading: boolean;
}) {
  return (
    <Command shouldFilter={false} className="w-full">
      <CommandItem
        onSelect={onCreateCategory}
        className="border-b text-blue-500 rounded-none cursor-pointer"
      >
        <Plus className="mr-2 h-4 w-4" />
        Criar nova categoria
      </CommandItem>
      <CommandInput
        placeholder="Buscar categoria..."
        value={searchTerm}
        onValueChange={onSearchChange}
        className="h-12"
      />
      <CommandList className="max-h-[300px]">
        <CategoryList
          onCategorySelect={onCategorySelect}
          getValues={getValues}
          categories={categories}
          isLoading={isLoading}
        />
      </CommandList>
    </Command>
  );
}

const CategorySelector = memo(
  ({
    open,
    onOpenChange,
    searchTerm,
    onSearchChange,
    onCategorySelect,
    onCreateCategory,
    getValues,
    errors,
  }: CategorySelectorProps) => {
    const isMobile = useIsMobile();
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const { data, searchData, isLoading, search } = useCategoriesData();

    // Search when debounced term changes
    useEffect(() => {
      search(debouncedSearchTerm);
    }, [debouncedSearchTerm, search]);

    // Use initial data for selected category and search data for the list
    const selectedCategory = data.find(
      (cat) => cat.id === getValues("categoryId")
    );
    const categories = searchData;

    const trigger = (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between h-12 text-base",
          errors.categoryId && "border-red-500"
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

    const content = (
      <CategorySelectorContent
        searchTerm={debouncedSearchTerm}
        onSearchChange={onSearchChange}
        onCategorySelect={onCategorySelect}
        onCreateCategory={onCreateCategory}
        getValues={getValues}
        categories={categories}
        isLoading={isLoading}
      />
    );

    if (isMobile) {
      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
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
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          {content}
        </PopoverContent>
      </Popover>
    );
  }
);

CategorySelector.displayName = "CategorySelector";

export const TransactionForm = memo(
  ({
    onSubmit,
    register,
    errors,
    getValues,
    setValue,
    setError,
    suggestedCategory,
    onCreateCategory,
    isSubmitting = false,
  }: TransactionFormProps) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [formState, setFormState] = useState({
      open: false,
      searchTerm: "",
      selectedCategory: "",
      showCreateDialog: false,
      isSubmitting: false,
      submitSuccess: false,
    });

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

    const handleOpenChange = useCallback((open: boolean) => {
      setFormState((prev) => ({ ...prev, open }));
    }, []);

    const handleCreateCategory = useCallback(() => {
      setFormState((prev) => ({
        ...prev,
        showCreateDialog: true,
      }));
    }, []);

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
        } catch (error) {
          setFormState((prev) => ({ ...prev, isSubmitting: false }));
          if (error instanceof ValidationError) {
            Object.entries(error.errors).forEach(([field, messages]) => {
              setError(field as keyof CreateTransactionInput, {
                type: "manual",
                message: messages[0],
              });
            });
          }
        }
      },
      [onSubmit, errors, setError]
    );

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
          <CategorySelector
            open={formState.open}
            onOpenChange={handleOpenChange}
            searchTerm={formState.searchTerm}
            onSearchChange={handleSearchChange}
            onCategorySelect={handleCategorySelect}
            onCreateCategory={handleCreateCategory}
            getValues={getValues}
            setValue={setValue}
            errors={errors}
          />
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
          onSuccess={handleCategorySelect}
          defaultCategoryName={suggestedCategory}
        />
      </form>
    );
  }
);

TransactionForm.displayName = "TransactionForm";
