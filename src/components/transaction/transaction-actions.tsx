"use client";

import { MoreVertical, Pencil, Trash, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Transaction } from "@/types/transaction";
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
import { useState } from "react";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
      {isMobile ? (
        <div className="flex items-center justify-center gap-4 py-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowEditDialog(true)}
            className="flex-1 gap-2"
          >
            <Pencil className="h-5 w-5" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowDeleteAlert(true)}
            className="flex-1 gap-2 text-red-600 hover:text-red-600 hover:border-red-600"
          >
            <Trash className="h-5 w-5" />
            Excluir
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-muted"
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
            >
              <Trash className="h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação será excluída
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Excluir"
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
