"use client";

import React, { memo, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import type { Transaction } from "../../types/transaction";
import { TransactionIcon } from "./transaction-icon";
import { TransactionAmount } from "./transaction-amount";
import { TransactionActions } from "./transaction-actions";
import { TransactionDeleteDialog } from "./transaction-delete-dialog";
import { cn } from "@/lib/utils";

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

  const formattedTime = React.useMemo(() => {
    return new Date(`2000-01-01T${transaction.time}`).toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }, [transaction.time]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(transaction.id);
    setShowDeleteDialog(false);
  };

  const isRecentlyModified =
    transaction.lastModified &&
    new Date().getTime() - new Date(transaction.lastModified).getTime() < 5000;

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 p-3 bg-white active:bg-gray-50 touch-manipulation transition-colors",
          isRecentlyModified && "bg-blue-50"
        )}
        onClick={() => setShowActions(true)}
      >
        <TransactionIcon
          category={transaction.category}
          type={transaction.type}
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate text-sm">
            {transaction.description}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="capitalize">{transaction.category}</span>
            <span>•</span>
            <time>{formattedTime}</time>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TransactionAmount
            amount={transaction.amount}
            type={transaction.type}
          />
          <div className="hidden md:flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(transaction);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full"
            >
              <Edit className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 hover:bg-gray-100 rounded-full"
            >
              <Trash2 className="w-4 h-4 text-gray-400" />
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
