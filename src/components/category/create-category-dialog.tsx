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
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
    reset,
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      type: "expense",
      name: "",
      icon: undefined,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedIcon = watch("icon");

  // Resetar o formulário quando o diálogo for aberto
  useEffect(() => {
    if (open) {
      reset({
        type: "expense",
        name: defaultCategoryName || "",
        icon: undefined,
      });
    }
  }, [open, defaultCategoryName, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      const response = await createCategory(data);
      onSuccess(response.data.id, data.name);
      onOpenChange(false);
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
          title: "Erro ao criar categoria",
          description: "Ocorreu um erro ao criar a categoria.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-[425px] w-[95vw] sm:w-full mx-auto">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Nova Categoria</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Crie uma nova categoria para organizar suas finanças
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
              defaultValue="expense"
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
