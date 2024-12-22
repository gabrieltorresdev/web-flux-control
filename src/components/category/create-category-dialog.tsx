import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "@/src/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { CreateCategoryInput } from "@/src/types/category";
import { useCreateCategory } from "@/src/hooks/use-categories";
import { cn } from "@/src/lib/utils";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["income", "expense"]),
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
    formState: { errors },
    reset,
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      type: "expense",
      name: "",
    },
  });

  const queryClient = useQueryClient();
  const createCategory = useCreateCategory();

  // Resetar o formulário quando o diálogo for aberto
  useEffect(() => {
    if (open) {
      reset({
        type: "expense",
        name: defaultCategoryName || "",
      });
    }
  }, [open, defaultCategoryName, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await createCategory.mutateAsync(data);
      onSuccess(response.data.id, data.name);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch {
      toast({
        title: "Erro ao criar categoria",
        description: "Ocorreu um erro ao criar a categoria.",
        variant: "destructive",
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full mx-auto">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Crie uma nova categoria para organizar suas finanças
          </DialogDescription>
        </DialogHeader>
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
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={createCategory.isPending}
          >
            {createCategory.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            Criar Categoria
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
