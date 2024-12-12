"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Transaction, TransactionInput } from "../types/transaction";
import { TransactionService } from "../services/transaction-service";
import { useToast } from "./use-toast";

const service = new TransactionService();
const ITEMS_PER_PAGE = 10;
const LOAD_DELAY = 1000;

export type TransactionSummary = {
  income: number;
  expense: number;
  total: number;
};

const defaultSummary: TransactionSummary = {
  income: 0,
  expense: 0,
  total: 0,
};

export function useTransactions() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>(defaultSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      await new Promise((r) => setTimeout(r, LOAD_DELAY));
      setIsLoading(true);
      const allTransactions = await service.getAll();

      // Get filters from URL
      const category = searchParams.get("category");
      const type = searchParams.get("type") as "income" | "expense" | null;
      const search = searchParams.get("search");
      const fromDate = searchParams.get("from");
      const toDate = searchParams.get("to");

      let filteredData = allTransactions;

      // Apply filters
      if (category) {
        filteredData = filteredData.filter((t) => t.category === category);
      }
      if (type) {
        filteredData = filteredData.filter((t) => t.type === type);
      }
      if (search) {
        filteredData = filteredData.filter((t) =>
          t.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (fromDate) {
        filteredData = filteredData.filter((t) => t.date >= fromDate);
      }
      if (toDate) {
        filteredData = filteredData.filter((t) => t.date <= toDate);
      }

      // Calculate summary
      const calculatedSummary = filteredData.reduce(
        (acc, transaction) => {
          const amount = Math.abs(transaction.amount);
          if (transaction.type === "income") {
            acc.income += amount;
          } else {
            acc.expense += amount;
          }
          acc.total = acc.income - acc.expense;
          return acc;
        },
        { ...defaultSummary }
      );

      const start = 0;
      const end = page * ITEMS_PER_PAGE;
      const paginatedData = filteredData.slice(start, end);

      setTransactions(paginatedData);
      setSummary(calculatedSummary);
      setHasMore(paginatedData.length < filteredData.length);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, toast, searchParams]);

  // Set default date range on mount if not present
  useEffect(() => {
    if (!searchParams.has("from") && !searchParams.has("to")) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      updateFilters({
        from: firstDay.toISOString(),
        to: lastDay.toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      await new Promise((resolve) => setTimeout(resolve, LOAD_DELAY));
      setPage((prev) => prev + 1);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar mais transações.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, toast]);

  const updateFilters = useCallback(
    (filters: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset page when filters change
      setPage(1);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const createTransaction = useCallback(
    async (data: TransactionInput) => {
      try {
        const newTransaction = await service.create(data);
        await fetchTransactions(); // Refresh the list after creating
        return newTransaction;
      } catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
      }
    },
    [fetchTransactions]
  );

  const updateTransaction = useCallback(
    async (id: string, data: TransactionInput) => {
      try {
        const updatedTransaction = await service.update(id, data);
        await fetchTransactions(); // Refresh the list after updating
        return updatedTransaction;
      } catch (error) {
        console.error("Error updating transaction:", error);
        throw error;
      }
    },
    [fetchTransactions]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      try {
        await service.delete(id);
        await fetchTransactions(); // Refresh the list after deleting
      } catch (error) {
        console.error("Error deleting transaction:", error);
        throw error;
      }
    },
    [fetchTransactions]
  );

  return {
    transactions,
    summary,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    updateFilters,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
