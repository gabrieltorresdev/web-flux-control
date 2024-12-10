"use client";

import React, { useCallback } from "react";
import { TransactionList } from "../components/transactions/transaction-list";
import { TransactionForm } from "../components/transactions/transaction-form";
import { TransactionSummary } from "../components/transactions/transaction-summary";
import {
  TransactionFilters,
  type TransactionFilters as Filters,
} from "../components/transactions/transaction-filters";
import { ActiveFilters } from "../components/transactions/active-filters";
import { useTransactions } from "../hooks/use-transactions";
import type { Transaction, TransactionInput } from "../types/transaction";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const {
    transactions,
    summary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    hasMore,
    loadMore,
    isLoading,
    isLoadingMore,
  } = useTransactions();

  const [showForm, setShowForm] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<
    Transaction | undefined
  >();
  const [selectedDate, setSelectedDate] = React.useState<string>();
  const [filters, setFilters] = React.useState<Filters>({
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
    },
    [createTransaction, toast]
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
      }
    },
    [editingTransaction, updateTransaction, toast]
  );

  const handleDeleteTransaction = useCallback(
    async (id: string) => {
      await deleteTransaction(id);
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
        variant: "destructive",
      });
    },
    [deleteTransaction, toast]
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
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Transações</h1>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <TransactionSummary summary={summary} />
        <div className="w-full flex justify-end">
          <Button
            onClick={handleNewTransaction}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova transação
          </Button>
        </div>
        <TransactionFilters filters={filters} onFilterChange={setFilters} />
        <ActiveFilters filters={filters} onFilterRemove={handleRemoveFilter} />

        <TransactionList
          transactions={transactions}
          onDeleteTransaction={handleDeleteTransaction}
          onEditTransaction={handleEdit}
          onAddTransaction={handleAddTransaction}
          hasMore={hasMore}
          onLoadMore={loadMore}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
        />

        <TransactionForm
          isVisible={showForm}
          onClose={handleCloseForm}
          onSubmit={
            editingTransaction ? handleEditTransaction : handleCreateTransaction
          }
          initialData={
            editingTransaction ||
            (selectedDate
              ? ({
                  date: selectedDate,
                  time: getCurrentDateTime().time,
                } as Transaction)
              : undefined)
          }
        />
      </CardContent>
    </Card>
  );
}
