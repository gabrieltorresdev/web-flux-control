"use client";

import { memo, useMemo } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { CreateTransactionInput } from "@/features/transactions/types";
import { DateTimePicker } from "@/shared/components/ui/date-time-picker";
import {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  UseFormGetValues,
} from "react-hook-form";
import { CategorySelector } from "@/features/categories/components/category-selector";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/get-query-client";
import {
  useCategoryStore,
  createCategorySelectors,
} from "@/features/categories/stores/category-store";
import { Category } from "@/features/categories/types";

interface TransactionFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  register: UseFormRegister<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
  setValue: UseFormSetValue<CreateTransactionInput>;
  watch: UseFormWatch<CreateTransactionInput>;
  getValues: UseFormGetValues<CreateTransactionInput>;
  isSubmitting?: boolean;
}

export const TransactionForm = memo(function TransactionForm({
  onSubmit,
  register,
  errors,
  setValue,
  watch,
  getValues,
  isSubmitting,
}: TransactionFormProps) {
  const queryClient = useQueryClient();
  const categoryId = watch("categoryId");
  const selectors = createCategorySelectors(useCategoryStore);
  const { categories } = selectors();
  const selectedCategory = useMemo(
    () => categories?.find((cat: Category) => cat.id === categoryId),
    [categories, categoryId]
  );

  const handleCategoryCreated = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.categories.all,
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6">
        <div className="grid gap-4">
          <div className="space-y-2.5">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="title"
            >
              Título
            </label>
            <Input
              id="title"
              {...register("title", { required: true })}
              className={`h-10 ${errors.title ? "border-destructive" : ""}`}
              placeholder="Ex: Almoço no restaurante"
              autoComplete="off"
              autoFocus
            />
            {errors.title && (
              <p className="text-sm font-medium text-destructive">
                Título é obrigatório
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="amount"
            >
              Valor
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...register("amount", { 
                required: true, 
                min: 0,
                valueAsNumber: true 
              })}
              className={`h-10 ${errors.amount ? "border-destructive" : ""}`}
              placeholder="0,00"
              autoComplete="off"
            />
            {errors.amount && (
              <p className="text-sm font-medium text-destructive">
                Valor é obrigatório e deve ser maior que zero
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="dateTime"
            >
              Data
            </label>
            <DateTimePicker
              value={getValues("dateTime")}
              onChange={(date) => date && setValue("dateTime", date)}
              className={errors.dateTime ? "border-destructive" : ""}
            />
            {errors.dateTime && (
              <p className="text-sm font-medium text-destructive">
                Data é obrigatória
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="categoryId"
            >
              Categoria
            </label>
            <CategorySelector
              value={categoryId}
              selectedCategory={selectedCategory}
              onChange={(value) => setValue("categoryId", value ?? "")}
              error={!!errors.categoryId}
              onCategoryCreated={handleCategoryCreated}
            />
            {errors.categoryId && (
              <p className="text-sm font-medium text-destructive">
                Categoria é obrigatória
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" />
              Salvar Transação
            </>
          )}
        </Button>
      </div>
    </form>
  );
});
