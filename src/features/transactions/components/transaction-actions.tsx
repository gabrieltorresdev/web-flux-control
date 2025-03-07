"use client";

import { MoreHorizontal, Pencil, Trash, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { Transaction } from "@/features/transactions/types";
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
import { useState } from "react";
import { EditTransactionDialog } from "./edit-transaction-dialog";

interface TransactionActionsProps {
  transaction: Transaction;
  onDelete: () => Promise<void>;
}

export function TransactionActions({
  transaction,
  onDelete,
}: TransactionActionsProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  return (
    <>
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
            onSelect={() => setShowEditDialog(true)}
            className="gap-2 py-2 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="text-sm">Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setShowDeleteAlert(true)}
            className="gap-2 py-2 text-destructive cursor-pointer"
          >
            <Trash className="h-3.5 w-3.5" />
            <span className="text-sm">Excluir</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="max-w-[350px] rounded-xl p-0 overflow-hidden">
          <div className="p-6">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transação</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Excluir esta transação? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="bg-muted/30 p-3 flex items-center space-x-2 justify-end">
            <AlertDialogCancel className="rounded-full h-9 text-sm px-4 m-0" disabled={isDeleting}>
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
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditTransactionDialog
        transaction={transaction}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}
