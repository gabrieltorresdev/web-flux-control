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

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (categoryId: string, categoryName: string) => void;
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
    reset,
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    defaultValues: {
      name: defaultCategoryName || "",
      type: "expense",
    },
  });

  const queryClient = useQueryClient();

  const createCategory = useCreateCategory();

  const onSubmit = handleSubmit(async (data) => {
    if (!data.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para a categoria",
        variant: "destructive",
      });
      return;
    }

    createCategory.mutate(
      {
        name: data.name.trim(),
        type: data.type,
      },
      {
        onSuccess: (response) => {
          if (response?.data) {
            reset();

            onSuccess?.(response.data.id, response.data.name);
            onOpenChange(false);
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast({
              title: "Categoria criada",
              description: "Categoria criada com sucesso",
            });
          }
        },
        onError: () => {
          toast({
            title: "Erro ao criar categoria",
            description: "Ocorreu um erro ao criar a categoria",
            variant: "destructive",
          });
        },
      }
    );
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
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              {...register("name")}
              placeholder="Ex: Alimentação"
              className={errors.name && "border-red-500"}
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
                register("type").onChange({
                  target: { value, name: "type" },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createCategory.isPending}
          >
            {createCategory.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Criar Categoria
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
