"use client";

import { memo, useMemo, useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Check, Loader2, MousePointerClick, AlertTriangle } from "lucide-react";
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
import { TransactionCreateCategoryDialog } from "./transaction-create-category-dialog";

interface TransactionFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  register: UseFormRegister<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
  setValue: UseFormSetValue<CreateTransactionInput>;
  watch: UseFormWatch<CreateTransactionInput>;
  getValues: UseFormGetValues<CreateTransactionInput>;
  isSubmitting?: boolean;
  selectedCategory?: Category;
  suggestedCategory?: string;
}

export const TransactionForm = memo(function TransactionForm({
  onSubmit,
  register,
  errors,
  setValue,
  watch,
  getValues,
  isSubmitting,
  selectedCategory: initialSelectedCategory,
  suggestedCategory,
}: TransactionFormProps) {
  const queryClient = useQueryClient();
  const categoryId = watch("categoryId");
  const amount = watch("amount");
  const selectors = createCategorySelectors(useCategoryStore);
  const { categories } = selectors();
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = useState(false);
  
  // Use the prop if provided, otherwise find it in the categories
  const selectedCategory = useMemo(
    () => initialSelectedCategory || categories?.find((cat: Category) => cat.id === categoryId),
    [categories, categoryId, initialSelectedCategory]
  );

  const handleCategoryCreated = async (categoryId?: string, categoryName?: string) => {
    // Define o ID da categoria criada no formulário (se existir)
    if (categoryId) {
      setValue("categoryId", categoryId);
    }
    setShowCreateCategoryDialog(false);

    // Revalidar o cache das categorias para atualizar o seletor
    await queryClient.invalidateQueries({
      queryKey: queryKeys.categories.all,
    });
  };

  // Função para verificar se a categoria sugerida já foi criada
  const isSuggestedCategoryCreated = () => {
    return categoryId && categoryId.length > 0;
  };

  // Função para extrair os nomes da categoria do draft
  const getSuggestedCategoryNames = () => {
    if (!suggestedCategory) return { original: "", created: "" };
    const [original, created] = suggestedCategory.split("|");
    return { original, created: created || original };
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
              type="currency"
              className={`h-10 ${errors.amount ? "border-destructive" : ""}`}
              placeholder="0,00"
              autoComplete="off"
              defaultValue={amount > 0 ? amount : undefined}
              onChange={(e) => {
                // Extract numeric value from formatted string (e.g., "R$ 10,00" -> 10)
                const numericValue = Number(e.target.value.replace(/\D/g, "")) / 100;
                setValue("amount", numericValue, { shouldValidate: true });
              }}
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
            
            {/* AI Category Suggestion Alert - só mostra se tiver sugestão e não tiver categoria selecionada */}
            {suggestedCategory && !categoryId && (
              <div className="mt-2 rounded-lg border bg-muted p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-2">
                    <MousePointerClick className="h-4 w-4 mt-1 sm:mt-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Categoria sugerida pela IA: <strong>{getSuggestedCategoryNames().original}</strong>
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setShowCreateCategoryDialog(true)}
                  >
                    Criar categoria
                  </Button>
                </div>
              </div>
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
      
      {/* Modal de criação de categoria */}
      {suggestedCategory && (
        <TransactionCreateCategoryDialog
          open={showCreateCategoryDialog}
          onOpenChange={setShowCreateCategoryDialog}
          defaultCategoryName={getSuggestedCategoryNames().original}
          onSuccess={handleCategoryCreated}
        />
      )}
    </form>
  );
});
