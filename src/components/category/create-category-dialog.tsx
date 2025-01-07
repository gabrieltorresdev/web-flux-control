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
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { CreateCategoryInput } from "@/types/category";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconPicker } from "./icon-picker";
import { ValidationError } from "@/lib/api/error-handler";
import { createCategory } from "@/app/actions/categories";
import { useCategoryStore } from "@/stores/category-store";

const createCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["income", "expense"]),
  icon: z.string().optional(),
});

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (categoryId: string, categoryName: string) => void;
  defaultCategoryName?: string;
}

export function CreateCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultCategoryName,
}: CreateCategoryDialogProps) {
  const { form, isSubmitting, selectedIcon, handleCreateCategory } =
    useCreateCategory({
      open,
      onOpenChange,
      onSuccess,
      defaultCategoryName,
    });

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Nova Categoria</ResponsiveModalTitle>
          <ResponsiveModalDescription />
        </ResponsiveModalHeader>
        <form onSubmit={handleCreateCategory} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              {...form.register("name")}
              placeholder="Ex: Alimentação"
              className={cn(
                "h-12 text-base px-4",
                form.formState.errors.name && "border-red-500"
              )}
              autoComplete="off"
              autoCapitalize="words"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select
              defaultValue="expense"
              onValueChange={(value) =>
                form.setValue("type", value as "income" | "expense")
              }
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
            {form.formState.errors.type && (
              <p className="text-sm text-red-500">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ícone (opcional)</label>
            <IconPicker
              value={selectedIcon}
              onChange={(icon) => form.setValue("icon", icon)}
            />
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Criar Categoria"
            )}
          </Button>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

function useCreateCategory({
  open,
  onOpenChange,
  onSuccess,
  defaultCategoryName,
}: CreateCategoryDialogProps) {
  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      type: "expense",
      name: "",
      icon: undefined,
    },
  });

  const selectedIcon = form.watch("icon");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      form.reset({
        type: "expense",
        name: defaultCategoryName || "",
        icon: undefined,
      });
    }
  }, [open, defaultCategoryName, form, form.reset]);

  const handleCreateCategory = form.handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      const response = await createCategory(data);
      await useCategoryStore.getState().forceReload();
      onSuccess(response.data.id, data.name);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ValidationError) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          form.setError(field as keyof CreateCategoryInput, {
            type: "manual",
            message: messages[0],
          });
        });
      } else {
        toast({
          title: "Erro ao criar categoria",
          description: "Ocorreu um erro ao criar a categoria.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    form,
    isSubmitting,
    selectedIcon,
    handleCreateCategory,
  };
}
