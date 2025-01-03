"use client";

import { memo, useState, useMemo, useCallback } from "react";
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
  UseFormSetValue,
} from "react-hook-form";
import { CreateCategoryDialog } from "@/components/category/create-category-dialog";
import { CategorySelectItem } from "../../category/category-select-item";
import { Category } from "@/types/category";
import { useDebounce } from "@/hooks/lib/use-debounce";
import { useCategories } from "@/hooks/use-categories";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type FormState = {
  open: boolean;
  searchTerm: string;
  selectedCategory: string;
  showCreateDialog: boolean;
  isSubmitting: boolean;
  submitSuccess: boolean;
};

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

interface CategorySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCategorySelect: (categoryId: string) => void;
  onCreateCategory: () => void;
  getValues: UseFormGetValues<CreateTransactionInput>;
  setValue: UseFormSetValue<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
}

const CategoryList = memo(
  ({
    onCategorySelect,
    getValues,
    categories,
    isLoading,
  }: {
    onCategorySelect: (categoryId: string, categoryName: string) => void;
    getValues: UseFormGetValues<CreateTransactionInput>;
    categories: Category[];
    isLoading: boolean;
  }) => {
    const categoryId = getValues("categoryId");

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!categories.length) {
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
        {categories.map((category) => (
          <CommandItem
            key={category.id}
            value={category.id}
            onSelect={(value) => onCategorySelect(value, category.name)}
            className="py-2"
          >
            <CategorySelectItem category={category} />
            {categoryId === category.id && (
              <Check className="ml-auto h-4 w-4 opacity-50" />
            )}
          </CommandItem>
        ))}
      </>
    );
  }
);

CategoryList.displayName = "CategoryList";

const CategorySelectorContent = memo(
  ({
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
  }) => (
    <Command shouldFilter={false} className="w-full">
      <CommandItem
        onSelect={onCreateCategory}
        className="border-b text-primary rounded-none cursor-pointer hover:bg-muted"
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
  )
);

CategorySelectorContent.displayName = "CategorySelectorContent";

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
    const { data, isLoading } = useCategories(debouncedSearchTerm);
    const categories = data?.data ?? [];
    const categoryId = getValues("categoryId");

    const filteredCategories = useMemo(
      () =>
        !searchTerm
          ? categories
          : categories.filter((cat) =>
              cat.name.toLowerCase().includes(searchTerm.toLowerCase())
            ),
      [categories, searchTerm]
    );

    const selectedCategory = useMemo(
      () => categories.find((cat) => cat.id === categoryId),
      [categories, categoryId]
    );

    const content = (
      <CategorySelectorContent
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onCategorySelect={onCategorySelect}
        onCreateCategory={onCreateCategory}
        getValues={getValues}
        categories={filteredCategories}
        isLoading={isLoading}
      />
    );

    const trigger = (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between h-12 text-base",
          errors.categoryId && "border-destructive text-destructive"
        )}
      >
        {selectedCategory ? (
          <CategorySelectItem category={selectedCategory} showType={false} />
        ) : (
          <span className="text-muted-foreground">Selecione uma categoria</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );

    if (isMobile) {
      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent side="bottom" className="h-[400px]">
            <SheetHeader>
              <SheetTitle>Selecionar categoria</SheetTitle>
              <SheetDescription>
                Escolha uma categoria para a transação
              </SheetDescription>
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
    suggestedCategory,
    onCreateCategory,
    isSubmitting,
  }: TransactionFormProps) => {
    const [state, setState] = useState<FormState>({
      open: false,
      searchTerm: "",
      selectedCategory: "",
      showCreateDialog: false,
      isSubmitting: false,
      submitSuccess: false,
    });

    const handleOpenChange = useCallback((open: boolean) => {
      setState((prev) => ({ ...prev, open }));
    }, []);

    const handleSearchChange = useCallback((value: string) => {
      setState((prev) => ({ ...prev, searchTerm: value }));
    }, []);

    const handleCategorySelect = useCallback(
      (categoryId: string) => {
        setValue("categoryId", categoryId);
        setState((prev) => ({ ...prev, open: false }));
      },
      [setValue]
    );

    const handleCreateCategory = useCallback(() => {
      setState((prev) => ({
        ...prev,
        showCreateDialog: true,
        open: false,
      }));
    }, []);

    const handleCreateCategorySuccess = useCallback(
      (categoryId: string, categoryName: string) => {
        setValue("categoryId", categoryId);
        setState((prev) => ({ ...prev, showCreateDialog: false }));
        onCreateCategory?.(categoryName);
      },
      [setValue, onCreateCategory]
    );

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Título"
              className={cn(
                "h-12 text-base pl-10",
                errors.title && "border-destructive text-destructive"
              )}
              {...register("title")}
            />
            <CircleDollarSign
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground",
                errors.title && "text-destructive"
              )}
            />
          </div>
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Input
              type="number"
              step="0.01"
              placeholder="Valor"
              className={cn(
                "h-12 text-base pl-10",
                errors.amount && "border-destructive text-destructive"
              )}
              {...register("amount", { valueAsNumber: true })}
            />
            <ArrowUpDown
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground",
                errors.amount && "text-destructive"
              )}
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <CategorySelector
            open={state.open}
            onOpenChange={handleOpenChange}
            searchTerm={state.searchTerm}
            onSearchChange={handleSearchChange}
            onCategorySelect={handleCategorySelect}
            onCreateCategory={handleCreateCategory}
            getValues={getValues}
            setValue={setValue}
            errors={errors}
          />
          {errors.categoryId && (
            <p className="text-sm text-destructive">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <DateTimePicker
            value={getValues("dateTime")}
            onChange={(date) => date && setValue("dateTime", date)}
            className={cn(
              "h-12",
              errors.dateTime && "border-destructive text-destructive"
            )}
          />
          {errors.dateTime && (
            <p className="text-sm text-destructive">
              {errors.dateTime.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Salvar"
          )}
        </Button>

        <CreateCategoryDialog
          open={state.showCreateDialog}
          onOpenChange={(open) =>
            setState((prev) => ({ ...prev, showCreateDialog: open }))
          }
          onSuccess={handleCreateCategorySuccess}
          defaultCategoryName={suggestedCategory}
        />
      </form>
    );
  }
);

TransactionForm.displayName = "TransactionForm";
