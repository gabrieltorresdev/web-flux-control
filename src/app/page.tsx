"use client";

import { useCallback, useState } from "react";
import { TransactionList } from "../components/transactions/transaction-list";
import { TransactionForm } from "../components/transactions/transaction-form";
import { TransactionSummary } from "../components/transactions/summary/transaction-summary";
import {
  TransactionFilters,
  type TransactionFilters as Filters,
} from "../components/transactions/filters/transaction-filters";
import { ActiveFilters } from "../components/transactions/filters/active-filters";
import { useTransactions } from "../hooks/use-transactions";
import type { Transaction, TransactionInput } from "../types/transaction";
import { Button } from "@/components/ui/button";
import { Mic, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { VoiceTransactionDialog } from "@/components/transactions/voice/voice-transaction-dialog";

export default function Home() {
  const { toast } = useToast();
  const {
    transactions,
    summary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    hasMore,
    hasPrevious,
    loadMore,
    loadPrevious,
    isLoading,
    isLoadingMore,
    isLoadingPrevious,
    error,
    loadTransactions,
  } = useTransactions();

  const [showForm, setShowForm] = useState(false);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >();
  const [selectedDate, setSelectedDate] = useState<string>();
  const [filters, setFilters] = useState<Filters>({
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    },
  });

  const handleCreateTransaction = useCallback(
    async (data: TransactionInput) => {
      const transaction = await createTransaction(data);
      toast({
        title: "Transação criada",
        description: "A transação foi criada com sucesso.",
      });
      setSelectedDate(undefined);
      setShowForm(false);
      // Reload data after creating transaction
      loadTransactions();
    },
    [createTransaction, toast, loadTransactions]
  );

  const handleEditTransaction = useCallback(
    async (data: TransactionInput) => {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data);
        toast({
          title: "Transação atualizada",
          description: "A transação foi atualizada com sucesso.",
        });
        setEditingTransaction(undefined);
        setShowForm(false);
        // Reload data after updating transaction
        loadTransactions();
      }
    },
    [editingTransaction, updateTransaction, toast, loadTransactions]
  );

  const handleDeleteTransaction = useCallback(
    async (id: string) => {
      await deleteTransaction(id);
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
        variant: "destructive",
      });
      // Reload data after deleting transaction
      loadTransactions();
    },
    [deleteTransaction, toast, loadTransactions]
  );

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingTransaction(undefined);
    setSelectedDate(undefined);
  }, []);

  const handleAddTransaction = useCallback((date: string) => {
    setSelectedDate(date);
    setShowForm(true);
  }, []);

  const getCurrentDateTime = useCallback(() => {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return { date, time: `${hours}:${minutes}` };
  }, []);

  const handleNewTransaction = useCallback(() => {
    const { date } = getCurrentDateTime();
    setSelectedDate(date);
    setShowForm(true);
  }, [getCurrentDateTime]);

  const handleRemoveFilter = useCallback((key: keyof Filters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Transações</h1>
      </div>

      <TransactionSummary 
        summary={summary} 
        isLoading={isLoading}
        error={error}
      />

      <div className="flex flex-col gap-4">
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => setShowVoiceDialog(true)}
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Mic className="w-4 h-4 mr-2" />
            Nova transação por voz
          </Button>
          <Button
            onClick={handleNewTransaction}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova transação
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <TransactionFilters filters={filters} onFilterChange={setFilters} />
            <ActiveFilters
              filters={filters}
              onFilterRemove={handleRemoveFilter}
            />
          </CardContent>
        </Card>

        <Card className="pt-3">
          <TransactionList
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={handleEdit}
            onAddTransaction={handleAddTransaction}
            hasMore={hasMore}
            hasPrevious={hasPrevious}
            onLoadMore={loadMore}
            onLoadPrevious={loadPrevious}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            isLoadingPrevious={isLoadingPrevious}
            error={error}
            onRetry={loadTransactions}
          />
        </Card>
      </div>

      <TransactionForm
        isVisible={showForm}
        onClose={handleCloseForm}
        onSubmit={
          editingTransaction ? handleEditTransaction : handleCreateTransaction
        }
        initialData={
          editingTransaction
            ? {
                amount: editingTransaction?.amount,
                title: editingTransaction?.title,
                category: editingTransaction?.category.id,
                date: editingTransaction?.date ?? selectedDate,
                time: editingTransaction?.time ?? getCurrentDateTime().time,
                type: editingTransaction.category.type,
              }
            : undefined
        }
      />

      <VoiceTransactionDialog
        isOpen={showVoiceDialog}
        onClose={() => setShowVoiceDialog(false)}
        onSubmit={handleCreateTransaction}
      />
    </div>
  );
}