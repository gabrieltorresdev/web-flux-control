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
import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconPicker } from "./icon-picker";
import { ValidationError } from "@/shared/lib/api/error-handler";
import { createCategory } from "@/features/categories/actions/categories";
import { useCategoryStore } from "@/features/categories/stores/category-store";
import { ApiError } from "@/shared/lib/api/error-handler";
import { useToast } from "@/shared/hooks/use-toast";

const createCategorySchema = z.object({
  name: z.string()
    .min(1, "Nome é obrigatório")
    .max(50, "O nome deve ter no máximo 50 caracteres")
    .transform(name => name.trim())
    .refine(name => name.length > 0, {
      message: "O nome não pode estar em branco"
    }),
  type: z.enum(["income", "expense"]),
  icon: z.string().optional(),
});

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategoryName?: string;
  defaultCategoryType?: "income" | "expense";
  onSuccess?: (categoryId: string, categoryName: string) => void;
}

interface CreateCategoryHookReturn {
  form: ReturnType<typeof useForm<CreateCategoryInput>>;
  isSubmitting: boolean;
  selectedIcon: string | undefined;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function CreateCategoryDialog({
  open,
  onOpenChange,
  defaultCategoryName,
  defaultCategoryType,
  onSuccess,
}: CreateCategoryDialogProps) {
  const { form, isSubmitting, selectedIcon, handleSubmit } = useCreateCategory({
    open,
    onOpenChange,
    defaultCategoryName,
    defaultCategoryType,
    onSuccess,
  });

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Nova categoria</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Crie uma nova categoria para organizar suas transações
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="Nome da categoria"
                {...form.register("name")}
                disabled={isSubmitting}
                className={cn(
                  form.formState.errors.name && "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={form.formState.errors.name ? "name-error" : undefined}
              />
              {form.formState.errors.name && (
                <p 
                  id="name-error" 
                  className="text-sm text-destructive mt-1 flex items-center gap-1"
                >
                  <span className="sr-only">Erro:</span>
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Select
              defaultValue={form.getValues("type")}
              onValueChange={(value) =>
                form.setValue("type", value as "income" | "expense")
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <IconPicker
              value={selectedIcon}
              onChange={(icon: string) => form.setValue("icon", icon)}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              disabled={isSubmitting} 
              type="submit"
              className={cn(
                "relative",
                isSubmitting && "cursor-not-allowed opacity-50"
              )}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Criar
            </Button>
          </div>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

function useCreateCategory({
  open,
  onOpenChange,
  onSuccess = () => {},
  defaultCategoryName,
  defaultCategoryType = "expense",
}: CreateCategoryDialogProps): CreateCategoryHookReturn {
  const { toast } = useToast();
  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      type: defaultCategoryType,
      name: "",
      icon: undefined,
    },
  });

  const selectedIcon = form.watch("icon");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      form.reset({
        type: defaultCategoryType,
        name: defaultCategoryName || "",
        icon: undefined,
      });
    }
  }, [open, defaultCategoryName, defaultCategoryType, form]);

  const handleCreateCategory = useCallback(async (data: CreateCategoryInput) => {
    try {
      setIsSubmitting(true);
      const response = await createCategory(data);
      await useCategoryStore.getState().forceReload();
      onSuccess(response.data.id, data.name);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ValidationError) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (field === "name" && messages[0]?.includes("já está sendo utilizado")) {
            form.setError("name", {
              type: "manual",
              message: "Já existe uma categoria com este nome. Por favor, escolha outro nome.",
            });
            toast({
              title: "Nome já existente",
              description: "Já existe uma categoria com este nome. Por favor, escolha outro nome.",
              variant: "destructive",
            });
          } else {
            form.setError(field as keyof CreateCategoryInput, {
              type: "manual",
              message: messages[0],
            });
          }
        });
      } else if (error instanceof ApiError) {
        if (error.status === 401 || error.status === 403) {
          toast({
            title: "Sessão expirada",
            description: "Sua sessão expirou. Por favor, faça login novamente.",
            variant: "destructive",
          });
        } else if (error.status === 409) {
          form.setError("name", {
            type: "manual",
            message: "Já existe uma categoria com este nome. Por favor, escolha outro nome.",
          });
          toast({
            title: "Nome já existente",
            description: "Já existe uma categoria com este nome. Por favor, escolha outro nome.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao criar categoria",
            description: error.message || "Ocorreu um erro ao criar a categoria.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Erro ao criar categoria",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao criar a categoria.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onSuccess, onOpenChange, toast]);

  return {
    form,
    isSubmitting,
    selectedIcon,
    handleSubmit: form.handleSubmit(handleCreateCategory),
  };
}
