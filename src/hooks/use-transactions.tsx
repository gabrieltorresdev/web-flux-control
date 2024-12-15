"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/store";
import { useTransactionSummaryQuery } from "./queries/use-transaction-query";
import { TransactionService } from "@/services/transaction-service";
import { useToast } from "./use-toast";
import type { TransactionInput } from "@/types/transaction";

const service = new TransactionService();

export function useTransactions() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  const {
    transactions,
    isLoading,
    isLoadingMore,
    isLoadingPrevious,
    hasMore,
    hasPrevious,
    error,
    loadTransactions,
    loadMore,
    loadPrevious,
    setFilters,
  } = useStore();

  const filters = {
    page: searchParams.get("page") || "1",
    perPage: searchParams.get("perPage") || "15",
    search: searchParams.get("search") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    type: (searchParams.get("type") as "income" | "expense") ?? undefined,
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
  };

  const {
    data: summary = { income: 0, expense: 0, total: 0 },
    isLoading: isSummaryLoading,
  } = useTransactionSummaryQuery(filters.startDate, filters.endDate);

  const updateFilters = useCallback(
    (newFilters: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      if (!newFilters.page) {
        params.delete("page");
      }

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Handle initial date range setup
  useEffect(() => {
    if (isInitialMount.current && !searchParams.has("startDate") && !searchParams.has("endDate")) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      updateFilters({
        startDate: firstDay.toISOString(),
        endDate: lastDay.toISOString(),
      });
    }
    isInitialMount.current = false;
  }, [searchParams, updateFilters]);

  // Handle filter changes
  useEffect(() => {
    if (!isInitialMount.current) {
      const filtersChanged = JSON.stringify(filters) !== JSON.stringify(useStore.getState().filters);
      if (filtersChanged) {
        setFilters(filters);
        loadTransactions();
      }
    }
  }, [filters, setFilters, loadTransactions]);

  const createTransaction = useCallback(
    async (data: TransactionInput) => {
      try {
        const result = await service.create(data);
        loadTransactions();
        return result;
      } catch (error) {
        console.error("Error creating transaction:", error);
        toast({
          title: "Erro",
          description: "Não foi possível criar a transação.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast, loadTransactions]
  );

  const updateTransaction = useCallback(
    async (id: string, data: TransactionInput) => {
      try {
        const result = await service.update(id, data);
        loadTransactions();
        return result;
      } catch (error) {
        console.error("Error updating transaction:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a transação.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast, loadTransactions]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      try {
        await service.delete(id);
        loadTransactions();
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a transação.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast, loadTransactions]
  );

  return {
    transactions,
    summary,
    isLoading: isLoading || isSummaryLoading,
    isLoadingMore,
    isLoadingPrevious,
    error,
    hasMore,
    hasPrevious,
    loadMore,
    loadPrevious,
    updateFilters,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    loadTransactions,
  };
}