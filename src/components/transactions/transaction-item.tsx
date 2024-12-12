"use client";

import React, { memo, useState, useCallback } from "react";
import { Edit, Trash2 } from "lucide-react";
import type { Transaction } from "../../types/transaction";
import { TransactionIcon } from "./transaction-icon";
import { TransactionAmount } from "./transaction-amount";
import { TransactionActions } from "./transaction-actions";
import { TransactionDeleteDialog } from "./transaction-delete-dialog";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type TransactionItemProps = {
  transaction: Transaction;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
};

function TransactionItemComponent({
  transaction,
  onDelete,
  onEdit,
}: TransactionItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isMobile = useIsMobile();

  const formattedTime = React.useMemo(() => {
    return new Date(`2000-01-01T${transaction.time}`).toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }, [transaction.time]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    onDelete(transaction.id);
    setShowDeleteDialog(false);
  }, [transaction.id, onDelete]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(transaction);
    },
    [transaction, onEdit]
  );

  const isRecentlyModified =
    transaction.lastModified &&
    new Date().getTime() - new Date(transaction.lastModified).getTime() < 5000;

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors rounded-lg cursor-pointer md:cursor-default touch-manipulation active:bg-accent/50",
          isRecentlyModified && "bg-blue-50/50"
        )}
        onClick={() => isMobile && setShowActions(true)}
      >
        <TransactionIcon
          category={transaction.category}
          type={transaction.type}
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">
            {transaction.description}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{transaction.category}</span>
            <span className="opacity-25">•</span>
            <time>{formattedTime}</time>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TransactionAmount
            amount={transaction.amount}
            type={transaction.type}
          />
          <div className="hidden md:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1.5 hover:bg-accent rounded-full"
            >
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 hover:bg-accent rounded-full"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <TransactionActions
        isVisible={showActions}
        onClose={() => setShowActions(false)}
        onEdit={onEdit}
        onDelete={onDelete}
        transaction={transaction}
      />

      <TransactionDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

export const TransactionItem = memo(TransactionItemComponent);
