"use client";

import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, ArrowUpDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { CreateTransactionInput } from "@/types/transaction";
import {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { CategorySelector } from "@/components/category/category-selector";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/get-query-client";

interface TransactionFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  register: UseFormRegister<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
  getValues: UseFormGetValues<CreateTransactionInput>;
  setValue: UseFormSetValue<CreateTransactionInput>;
  watch: UseFormWatch<CreateTransactionInput>;
  suggestedCategory?: string;
  onCreateCategory?: (name: string) => void;
  isSubmitting?: boolean;
}

export const TransactionForm = memo(function TransactionForm({
  onSubmit,
  register,
  errors,
  getValues,
  setValue,
  watch,
  isSubmitting,
}: TransactionFormProps) {
  const queryClient = useQueryClient();
  const categoryId = watch("categoryId");

  const handleCategoryCreated = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.categories.all,
    });
  };

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
          value={categoryId || undefined}
          onChange={(value) => setValue("categoryId", value || "")}
          error={!!errors.categoryId}
          onCategoryCreated={handleCategoryCreated}
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
          <p className="text-sm text-destructive">{errors.dateTime.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Salvar
            </>
          )}
        </Button>
      </div>
    </form>
  );
});
