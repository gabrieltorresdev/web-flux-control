"use client";

import { Category } from "@/features/categories/types";
import { memo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { MoreVertical, Pencil, Trash, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { EditCategoryDialog } from "@/features/categories/components/edit-category-dialog";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/utils";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { CategoryIcon } from "./category-icon";
import { deleteCategory } from "@/features/categories/actions/categories";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useCategoryStore } from "@/features/categories/stores/category-store";

interface CategoryItemProps {
  category: Category;
}

export const CategoryItem = memo(({ category }: CategoryItemProps) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const x = useMotionValue(0);

  // Transform x motion into opacity and scale for the action buttons
  const actionButtonsOpacity = useTransform(x, [-100, -20], [1, 0]);
  const scale = useTransform(x, [-100, -20], [1, 0.8]);
  const backgroundOpacity = useTransform(x, [-100, 0], [1, 0]);

  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteCategory(category.id);
      // Força o recarregamento das categorias após a exclusão
      await useCategoryStore.getState().forceReload();
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
      // Reset swipe position after successful delete
      x.set(0);
      setIsOpen(false);
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a categoria.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x < -50) {
      setIsOpen(true);
      x.set(-100);
    } else {
      setIsOpen(false);
      x.set(0);
    }
  };

  const handleTap = () => {
    if (isOpen) {
      setIsOpen(false);
      x.set(0);
    } else {
      setIsOpen(true);
      x.set(-100);
    }
  };

  const isIncome = category.type === "income";

  const Content = () => (
    <div className="flex items-center gap-4">
      <CategoryIcon
        icon={category.icon}
        isIncome={isIncome}
        className={cn(
          "w-10 h-10",
          category.isDefault && "opacity-75",
          isIncome
            ? "text-[hsl(var(--income-foreground))]"
            : "text-[hsl(var(--expense-foreground))]"
        )}
      />
      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "font-medium text-base line-clamp-1 break-all",
            category.isDefault ? "text-foreground/75" : "text-foreground/90"
          )}
        >
          {category.name}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              isIncome
                ? "bg-[hsl(var(--income)/0.08)] text-[hsl(var(--income-foreground))]"
                : "bg-[hsl(var(--expense)/0.08)] text-[hsl(var(--expense-foreground))]"
            )}
          >
            {isIncome ? "Receita" : "Despesa"}
          </span>
          {category.isDefault && (
            <span className="text-xs text-muted-foreground/75">Padrão</span>
          )}
        </div>
      </div>
      {!isMobile && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-muted"
                aria-label="Abrir menu"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setShowEditDialog(true)}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setShowDeleteAlert(true)}
                className="gap-2 text-destructive"
                disabled={category.isDefault}
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
        <motion.div className="relative overflow-hidden">
          {/* Background with action buttons */}
          <motion.div
            className="absolute inset-0 flex items-center justify-end px-4 bg-accent/50"
            style={{ opacity: backgroundOpacity }}
          >
            <motion.div
              className="flex items-center gap-2"
              style={{ opacity: actionButtonsOpacity }}
            >
              <motion.button
                className="p-2.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground"
                style={{ scale }}
                onClick={() => setShowEditDialog(true)}
              >
                <Pencil className="h-4 w-4" />
              </motion.button>
              <motion.button
                className={cn(
                  "p-2.5 rounded-full text-destructive-foreground",
                  "bg-destructive hover:bg-destructive/90",
                  category.isDefault && "opacity-50 pointer-events-none"
                )}
                style={{ scale }}
                onClick={() => setShowDeleteAlert(true)}
                disabled={category.isDefault}
              >
                <Trash className="h-4 w-4" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Main content */}
          <motion.div
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: -100, right: 0 }}
            dragElastic={0.1}
            dragMomentum={false}
            style={{ x }}
            onDragEnd={handleDragEnd}
            onClick={handleTap}
            className={cn(
              "touch-manipulation bg-background cursor-pointer",
              "active:bg-accent/50 transition-colors"
            )}
          >
            <div className="p-4 relative">
              <Content />
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <div
          className={cn(
            "group transition-all duration-200 hover:bg-accent/50 p-4",
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
              {category.isDefault ? "Categoria padrão" : "Tem certeza?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {category.isDefault
                ? "Esta é uma categoria padrão do sistema e não pode ser excluída."
                : "Esta ação não pode ser desfeita. A categoria será excluída permanentemente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {category.isDefault ? (
              <AlertDialogCancel>Entendi</AlertDialogCancel>
            ) : (
              <>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Excluir"
                  )}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditCategoryDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        category={category}
      />
    </>
  );
});

CategoryItem.displayName = "CategoryItem";
