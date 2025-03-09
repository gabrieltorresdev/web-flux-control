"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Trash2,
  Loader2,
  NotebookPen,
  Calendar,
  BadgeInfo,
  Clock,
  BookText,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { memo, useCallback, useState, useRef } from "react";
import { Transaction } from "@/features/transactions/types";
import { format } from "date-fns";
import { formatNumberToBRL } from "@/shared/utils";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { CategoryIcon } from "@/features/categories/components/category-icon";
import { deleteTransaction } from "@/features/transactions/actions/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/get-query-client";
import { EditTransactionDialog } from "./edit-transaction-dialog";
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
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

// Extend the Transaction type from the imported type
interface ExtendedTransaction extends Transaction {
  description?: string;
}

interface TransactionItemProps {
  transaction: ExtendedTransaction;
}

interface TransactionContentProps {
  transaction: ExtendedTransaction;
  isMobile: boolean;
  handleDelete: () => Promise<void>;
}

export const TransactionItem = memo(({ transaction }: TransactionItemProps) => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Ref para controle de cliques
  const actionClickedRef = useRef(false);

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true);
      await deleteTransaction(transaction.id);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      toast.success("Transação excluída", {
        description: "A transação foi excluída com sucesso.",
      });
    } catch {
      toast.error("Erro ao excluir", {
        description: "Ocorreu um erro ao excluir a transação.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }, [transaction.id, queryClient]);

  // Funções para lidar com o modal de edição
  const openEditDialog = useCallback(() => {
    setIsEditOpen(true);
  }, []);

  // Funções para lidar com o modal de exclusão
  const openDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  // Handler para clique no item
  const handleItemClick = useCallback(() => {
    // Apenas abre o modal de edição se não estiver no meio de uma ação de botão
    // e estiver no mobile (comportamento para desktop é diferente)
    if (isMobile && !actionClickedRef.current) {
      openEditDialog();
    }
    // Resetamos o flag após o clique
    actionClickedRef.current = false;
  }, [isMobile, openEditDialog]);

  return (
    <>
      <div
        className="relative transition-all duration-150 border-b border-border/40 last:border-0 hover:bg-muted/50"
        onClick={handleItemClick}
      >
        <div className="p-3 flex items-center touch-manipulation relative transition-all duration-150">
          <TransactionContent
            transaction={transaction}
            isMobile={isMobile}
            handleDelete={handleDelete}
          />

          <div className="flex items-center ml-1"
               onClick={(e) => {
                // Marca que um clique de ação ocorreu
                actionClickedRef.current = true;
                // Previne que o clique se propague e ative o modal de edição
                e.stopPropagation();
               }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-muted rounded-full flex items-center justify-center"
                  aria-label="Ações"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Ações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-lg shadow-md">
                <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium">
                  Ações
                </div>
                <div className="h-px bg-border/50 -mx-1 my-0.5"></div>
                <DropdownMenuItem
                  onSelect={() => openEditDialog()}
                  className="gap-2 py-2 cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="text-sm">Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => openDeleteDialog()}
                  className="gap-2 py-2 text-destructive cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="text-sm">Excluir</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <EditTransactionDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        transaction={transaction}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent 
          className="max-w-[350px] rounded-xl p-0 overflow-hidden"
          // Evita que cliques no modal se propaguem para elementos abaixo
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transação</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Excluir esta transação? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="bg-muted/30 p-3 flex items-center space-x-2 justify-end">
            <AlertDialogCancel 
              className="rounded-full h-9 text-sm px-4 m-0"
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 rounded-full h-9 text-sm px-4"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

const TransactionContent = memo(function TransactionContent({
  transaction,
  isMobile,
}: TransactionContentProps) {
  const isIncome = transaction.category.type === "income";
  const dateFormatted = format(new Date(transaction.dateTime), "HH:mm");

  return (
    <div className="flex-1 flex items-center min-w-0 gap-3">
      <div className="flex-shrink-0 flex">
        <div
          className={cn(
            "flex items-center justify-center rounded-full flex-1 h-10 w-10",
          )}
        >
          <CategoryIcon icon={transaction.category.icon} isIncome={isIncome} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground truncate font-medium">
                {transaction.category.name}
              </span>
              <div className="flex items-center gap-1 opacity-60">
                <BookText className="h-3 w-3 flex-shrink-0" />
                <span className="text-xs font-medium line-clamp-1 italic">
                  {transaction.title}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  isIncome ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {isIncome ? "+" : "-"}
                {formatNumberToBRL(transaction.amount)}
              </span>

              <span className="text-xs font-medium truncate max-w-[180px] italic opacity-60">
                {dateFormatted}h
              </span>
            </div>
          </div>

          {transaction.description && (
            <div className="mt-1 flex items-start text-xs text-muted-foreground gap-1">
              <NotebookPen className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span className="truncate">{transaction.description}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TransactionItem.displayName = "TransactionItem";
TransactionContent.displayName = "TransactionContent";
