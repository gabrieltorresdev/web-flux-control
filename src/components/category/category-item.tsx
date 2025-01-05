"use client";

import { Category } from "@/types/category";
import { memo, useState } from "react";
import { Button } from "../ui/button";
import { MoreVertical, Pencil, Trash, Loader2 } from "lucide-react";
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
import { EditCategoryDialog } from "@/components/category/edit-category-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { CategoryIcon } from "./category-icon";
import { deleteCategory } from "@/app/actions/categories";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";

interface CategoryItemProps {
  category: Category;
}

export const CategoryItem = memo(({ category }: CategoryItemProps) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const x = useMotionValue(0);

  // Transform x motion into opacity and scale for the action buttons
  const actionButtonsOpacity = useTransform(x, [-100, -20], [1, 0]);
  const scale = useTransform(x, [-100, -20], [1, 0.8]);

  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteCategory(category.id);
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
      // Reset swipe position after successful delete
      x.set(0);
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

  const isIncome = category.type === "income";

  const Content = () => (
    <div className="flex items-center gap-3">
      <CategoryIcon icon={category.icon} isIncome={isIncome} />
      <div className="flex-1">
        <h3 className="font-medium text-foreground/90 line-clamp-1 break-all">
          {category.name}
        </h3>
        <span className="text-xs text-muted-foreground">
          {isIncome ? "Receita" : "Despesa"}
          {category.isDefault && " • Padrão"}
        </span>
      </div>
      {!isMobile && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground/70 hover:text-muted-foreground"
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
          {/* Action buttons container */}
          <motion.div
            className="absolute right-0 h-full flex items-center gap-2 px-3 bg-background"
            style={{ opacity: actionButtonsOpacity }}
          >
            <motion.button
              className="p-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground"
              style={{ scale }}
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="h-4 w-4" />
            </motion.button>
            <motion.button
              className="p-2 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              style={{ scale }}
              onClick={() => setShowDeleteAlert(true)}
              disabled={category.isDefault}
            >
              <Trash className="h-4 w-4" />
            </motion.button>
          </motion.div>

          {/* Main content with drag */}
          <motion.div
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: -100, right: 0 }}
            dragElastic={0.1}
            dragMomentum={false}
            style={{ x }}
            className={cn(
              "group touch-manipulation bg-background",
              "active:bg-accent/50 transition-colors"
            )}
            onDragEnd={(
              _: MouseEvent | TouchEvent | PointerEvent,
              info: PanInfo
            ) => {
              // If dragged more than halfway, keep it open
              if (info.offset.x < -50) {
                x.set(-100);
              } else {
                x.set(0);
              }
            }}
          >
            <div
              className={cn(
                "p-3 touch-manipulation relative",
                isPressed && "bg-accent/30"
              )}
              onTouchStart={() => setIsPressed(true)}
              onTouchEnd={() => setIsPressed(false)}
              onTouchCancel={() => setIsPressed(false)}
            >
              <Content />
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <div
          className={cn(
            "group transition-all duration-200 hover:bg-accent/50 p-3",
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
        category={category}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
});

CategoryItem.displayName = "CategoryItem";
