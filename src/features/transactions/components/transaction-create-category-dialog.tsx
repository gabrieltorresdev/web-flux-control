import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/shared/components/ui/responsive-modal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { CreateCategoryInput } from "@/features/categories/types";
import { cn } from "@/shared/utils";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconPicker } from "@/features/categories/components/icon-picker";
import { ValidationError } from "@/shared/lib/api/error-handler";
import { createCategory } from "@/features/categories/actions/categories";
import { useCategoryStore } from "@/features/categories/stores/category-store";
import { toast } from "sonner";

const createCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["income", "expense"]),
  icon: z.string().optional(),
});

interface TransactionCreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (categoryId?: string, categoryName?: string) => Promise<void>;
  defaultCategoryName?: string;
}

/**
 * Versão modificada do CreateCategoryDialog específica para o fluxo de transações
 * Não fecha o modal principal após criar uma categoria
 */
export function TransactionCreateCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultCategoryName,
}: TransactionCreateCategoryDialogProps) {
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

  // Preenche o nome da categoria com o valor sugerido quando o modal abre
  useEffect(() => {
    if (open) {
      form.reset({
        type: "expense",
        name: defaultCategoryName || "",
        icon: undefined,
      });
    }
  }, [open, defaultCategoryName, form]);

  const handleCreateCategory = form.handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      const response = await createCategory(data);
      
      // Recarrega as categorias
      await useCategoryStore.getState().forceReload();
      
      // Notifica o componente pai sobre a criação bem-sucedida
      await onSuccess(response.data.id, data.name);
      
      // Fecha APENAS o modal de criação de categoria, não o modal principal
      onOpenChange(false);

      // Notifica o usuário
      toast.success("Categoria criada", {
        description: "A categoria foi criada com sucesso.",
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          form.setError(field as keyof CreateCategoryInput, {
            type: "manual",
            message: messages[0],
          });
        });
      } else {
        toast.error("Erro ao criar categoria", {
          description: "Ocorreu um erro ao criar a categoria.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
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
              <SelectTrigger className="h-12 text-base w-full">
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