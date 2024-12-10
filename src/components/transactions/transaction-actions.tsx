import React, { memo, useCallback, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import type { Transaction } from "../../types/transaction";
import { TransactionDeleteDialog } from "./transaction-delete-dialog";

type TransactionActionsProps = {
  isVisible: boolean;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  transaction: Transaction;
};

function TransactionActionsComponent({
  isVisible,
  onClose,
  onEdit,
  onDelete,
  transaction,
}: TransactionActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(transaction);
      onClose();
    },
    [transaction, onEdit, onClose]
  );

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    onDelete(transaction.id);
    setShowDeleteDialog(false);
    onClose();
  }, [transaction.id, onDelete, onClose]);

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 animate-fade-in" onClick={onClose}>
        <div className="fixed inset-0 bg-black/20" />
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 animate-slide-up">
          <h3 className="text-lg font-medium mb-4">Ações</h3>
          <div className="space-y-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg"
            >
              <Edit className="w-5 h-5 text-gray-600" />
              <span>Editar transação</span>
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg text-red-600"
            >
              <Trash2 className="w-5 h-5" />
              <span>Excluir transação</span>
            </button>
          </div>
        </div>
      </div>

      <TransactionDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

export const TransactionActions = memo(TransactionActionsComponent);
