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
import { useToast } from "@/src/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Category, CreateCategoryInput } from "@/src/types/category";
import { useUpdateCategory } from "@/src/hooks/use-categories";
import { IconPicker } from "./icon-picker";

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
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    defaultValues: {
      name: category.name,
      type: category.type,
      icon: category.icon,
    },
  });

  const selectedIcon = watch("icon");

  const updateCategory = useUpdateCategory();

  const onSubmit = handleSubmit(async (data) => {
    if (!data.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para a categoria",
        variant: "destructive",
      });
      return;
    }

    updateCategory.mutate(
      {
        id: category.id,
        name: data.name.trim(),
        type: data.type,
        is_default: category.is_default,
        icon: data.icon,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          queryClient.invalidateQueries({ queryKey: ["categories"] });
          toast({
            title: "Categoria atualizada",
            description: "Categoria atualizada com sucesso",
          });
        },
        onError: () => {
          toast({
            title: "Erro ao atualizar categoria",
            description: "Ocorreu um erro ao atualizar a categoria",
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
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Edite os dados da categoria e clique em salvar para atualizar
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
              defaultValue={category.type}
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Ícone</label>
            <IconPicker
              value={selectedIcon}
              onChange={(value) => setValue("icon", value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={updateCategory.isPending}
          >
            {updateCategory.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Salvar Alterações
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
