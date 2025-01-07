import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "../ui/responsive-modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Category, CreateCategoryInput } from "@/types/category";
import { cn } from "@/lib/utils";
import { IconPicker } from "./icon-picker";
import { ValidationError } from "@/lib/api/error-handler";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateCategory } from "@/app/actions/categories";
import { memo, useCallback, useState } from "react";
import { useCategoryStore } from "@/stores/category-store";

const updateCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["income", "expense"]),
  icon: z.string().optional(),
});

interface EditCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditCategoryDialog = memo(function EditCategoryDialog({
  category,
  open,
  onOpenChange,
}: EditCategoryDialogProps) {
  const {
    form,
    selectedIcon,
    isSubmitting,
    handleTypeChange,
    handleIconChange,
    onSubmit,
  } = useEditCategory({
    category,
    onOpenChange,
  });

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Editar Categoria</ResponsiveModalTitle>
          <ResponsiveModalDescription />
        </ResponsiveModalHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              {...register("name")}
              placeholder="Ex: Alimentação"
              className={cn(
                "h-12 text-base px-4",
                errors.name && "border-red-500"
              )}
              autoComplete="off"
              autoCapitalize="words"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select
              defaultValue={category.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense" className="py-3 text-base">
                  Despesa
                </SelectItem>
                <SelectItem value="income" className="py-3 text-base">
                  Receita
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ícone (opcional)</label>
            <IconPicker value={selectedIcon} onChange={handleIconChange} />
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
});

interface UseEditCategoryProps {
  category: Category;
  onOpenChange: (open: boolean) => void;
}

function useEditCategory({ category, onOpenChange }: UseEditCategoryProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: category.name,
      type: category.type,
      icon: category.icon,
    },
  });

  const { setValue, watch, setError, handleSubmit } = form;

  const selectedIcon = watch("icon");

  const handleUpdateCategory = useCallback(
    async (data: CreateCategoryInput) => {
      try {
        setIsSubmitting(true);
        await updateCategory({
          id: category.id,
          name: data.name.trim(),
          type: data.type,
          isDefault: category.isDefault,
          icon: data.icon,
        });
        await useCategoryStore.getState().forceReload();
        onOpenChange(false);
        toast({
          title: "Categoria atualizada",
          description: "Categoria atualizada com sucesso",
        });
      } catch (error) {
        if (error instanceof ValidationError) {
          Object.entries(error.errors).forEach(([field, messages]) => {
            setError(field as keyof CreateCategoryInput, {
              type: "manual",
              message: messages[0],
            });
          });
        } else {
          toast({
            title: "Erro ao atualizar categoria",
            description: "Ocorreu um erro ao atualizar a categoria",
            variant: "destructive",
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [category.id, category.isDefault, onOpenChange, setError, toast]
  );

  const onSubmit = handleSubmit(handleUpdateCategory);

  const handleTypeChange = useCallback(
    (value: string) => {
      setValue("type", value as "income" | "expense");
    },
    [setValue]
  );

  const handleIconChange = useCallback(
    (icon: string) => {
      setValue("icon", icon);
    },
    [setValue]
  );

  return {
    form,
    selectedIcon,
    isSubmitting,
    handleTypeChange,
    handleIconChange,
    onSubmit,
  };
}
