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
import { useQueryClient } from "@tanstack/react-query";
import { Category, CreateCategoryInput } from "@/types/category";
import { useUpdateCategory } from "@/hooks/use-categories";
import { cn } from "@/lib/utils";
import { IconPicker } from "./icon-picker";
import { ValidationError } from "@/lib/api/error-handler";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
}: EditCategoryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: category.name,
      type: category.type,
      icon: category.icon,
    },
  });

  const selectedIcon = watch("icon");

  const updateCategory = useUpdateCategory();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        name: data.name.trim(),
        type: data.type,
        is_default: category.is_default,
        icon: data.icon,
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
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
    }
  });

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-[425px] w-[95vw] sm:w-full mx-auto">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Editar Categoria</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Edite os dados da categoria e clique em salvar para atualizar
          </ResponsiveModalDescription>
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
              onValueChange={(value) =>
                setValue("type", value as "income" | "expense")
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
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ícone (opcional)</label>
            <IconPicker
              value={selectedIcon}
              onChange={(icon) => setValue("icon", icon)}
            />
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={updateCategory.isPending}
          >
            {updateCategory.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
