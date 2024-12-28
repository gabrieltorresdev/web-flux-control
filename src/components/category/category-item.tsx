"use client";

import { Category } from "@/src/types/category";
import { memo, useState } from "react";
import { Button } from "../ui/button";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { EditCategoryDialog } from "@/src/components/category/edit-category-dialog";
import { useDeleteCategory } from "@/src/hooks/use-categories";
import { useToast } from "@/src/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/src/lib/utils";
import { useIsMobile } from "@/src/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { CategoryIcon } from "./category-icon";

interface CategoryItemProps {
  category: Category;
}

export const CategoryItem = memo(({ category }: CategoryItemProps) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteCategory = useDeleteCategory();
  const isMobile = useIsMobile();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteCategory.mutateAsync(category.id);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a categoria.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
      setIsDrawerOpen(false);
    }
  };

  const isIncome = category.type === "income";

  const CategoryActions = () => (
    <div className="flex items-center justify-center gap-4 py-2">
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          setShowEditDialog(true);
          setIsDrawerOpen(false);
        }}
        className="flex-1 gap-2"
      >
        <Pencil className="h-5 w-5" />
        Editar
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          setShowDeleteAlert(true);
          setIsDrawerOpen(false);
        }}
        className={cn(
          "flex-1 gap-2",
          "text-red-600 hover:text-red-600 hover:border-red-600"
        )}
        disabled={category.is_default}
      >
        <Trash className="h-5 w-5" />
        Excluir
      </Button>
    </div>
  );

  const Content = () => (
    <div className="flex items-center gap-3">
      <CategoryIcon icon={category.icon} isIncome={isIncome} />
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 line-clamp-1 break-all">
          {category.name}
        </h3>
        <span className="text-xs text-muted-foreground">
          {isIncome ? "Receita" : "Despesa"}
          {category.is_default && " • Padrão"}
        </span>
      </div>
      {!isMobile && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="Abrir menu"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => setShowEditDialog(true)}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setShowDeleteAlert(true)}
                className="gap-2 text-red-600"
                disabled={category.is_default}
              >
                <Trash className="h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <div
              className={cn(
                "group transition-all duration-200 active:bg-gray-50 p-3 touch-manipulation",
                "cursor-pointer"
              )}
            >
              <Content />
            </div>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Ações da Categoria</DrawerTitle>
            </DrawerHeader>
            <CategoryActions />
          </DrawerContent>
        </Drawer>
      ) : (
        <div
          className={cn(
            "group transition-all duration-200 hover:bg-gray-50 p-3",
            "cursor-pointer"
          )}
        >
          <Content />
        </div>
      )}

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {category.is_default ? "Categoria padrão" : "Tem certeza?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {category.is_default
                ? "Esta é uma categoria padrão do sistema e não pode ser excluída."
                : "Esta ação não pode ser desfeita. A categoria será excluída permanentemente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {category.is_default ? (
              <AlertDialogCancel>Entendi</AlertDialogCancel>
            ) : (
              <>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Excluir
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditCategoryDialog
        category={category}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
});

CategoryItem.displayName = "CategoryItem";
