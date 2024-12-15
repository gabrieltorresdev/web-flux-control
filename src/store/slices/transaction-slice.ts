"use client";

import { StateCreator } from "zustand";
import { TransactionService } from "@/services/transaction-service";
import type { Transaction, TransactionFilters } from "@/types/transaction";
import type { ApiTransactionResponse } from "@/types/api";
import { mapTransaction } from "@/lib/mappers/transaction-mapper";

export interface TransactionSlice {
  transactions: Transaction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isLoadingPrevious: boolean;
  hasMore: boolean;
  hasPrevious: boolean;
  currentPage: number;
  loadedPages: number[];
  error: Error | null;
  filters: TransactionFilters;

  setFilters: (filters: Partial<TransactionFilters>) => void;
  loadTransactions: () => Promise<void>;
  loadMore: () => Promise<void>;
  loadPrevious: () => Promise<void>;
  addTransactions: (
    transactions: Transaction[],
    page: number,
    meta: ApiTransactionResponse["meta"]
  ) => void;
  reset: () => void;
}

const service = new TransactionService();

export const createTransactionSlice: StateCreator<TransactionSlice> = (
  set,
  get
) => ({
  transactions: [],
  isLoading: false,
  isLoadingMore: false,
  isLoadingPrevious: false,
  hasMore: false,
  hasPrevious: false,
  currentPage: 1,
  loadedPages: [],
  error: null,
  filters: {},

  setFilters: (newFilters) => {
    set((state) => {
      // Se os filtros mudaram (exceto página), reseta o estado de paginação
      const filtersChanged = Object.entries(newFilters).some(([key, value]) => {
        if (key === "page") return false;
        return state.filters[key as keyof TransactionFilters] !== value;
      });

      if (filtersChanged) {
        return {
          filters: { ...newFilters },
          transactions: [],
          loadedPages: [],
          currentPage: 1,
          hasMore: false,
          hasPrevious: false,
        };
      }

      // Se apenas a página mudou, atualiza apenas os filtros
      return {
        filters: { ...state.filters, ...newFilters },
        currentPage: newFilters.page
          ? Number(newFilters.page)
          : state.currentPage,
      };
    });
  },

  loadTransactions: async () => {
    const { filters, loadedPages } = get();
    const page = Number(filters.page) || 1;

    if (loadedPages.includes(page)) return;

    set({ isLoading: true, error: null });

    try {
      const response = await service.getAll(filters);
      const mappedTransactions = response.data.map(mapTransaction);

      set((state) => ({
        transactions: [...state.transactions, ...mappedTransactions],
        loadedPages: [...state.loadedPages, page],
        hasMore: page < response.meta.last_page,
        hasPrevious: page > 1 && !state.loadedPages.includes(page - 1),
        currentPage: page,
      }));
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ isLoading: false });
    }
  },

  loadMore: async () => {
    const { currentPage, filters } = get();
    const nextPage = currentPage + 1;

    set({ isLoadingMore: true });

    try {
      const response = await service.getAll({
        ...filters,
        page: String(nextPage),
      });
      const mappedTransactions = response.data.map(mapTransaction);

      set((state) => ({
        transactions: [...state.transactions, ...mappedTransactions],
        loadedPages: [...state.loadedPages, nextPage],
        currentPage: nextPage,
        hasMore: nextPage < response.meta.last_page,
      }));
    } finally {
      set({ isLoadingMore: false });
    }
  },

  loadPrevious: async () => {
    const { currentPage, filters } = get();
    const previousPage = currentPage - 1;

    if (previousPage < 1) return;

    set({ isLoadingPrevious: true });

    try {
      const response = await service.getAll({
        ...filters,
        page: String(previousPage),
      });
      const mappedTransactions = response.data.map(mapTransaction);

      set((state) => ({
        transactions: [...mappedTransactions, ...state.transactions],
        loadedPages: [...state.loadedPages, previousPage],
        currentPage: previousPage,
        hasPrevious:
          previousPage > 1 && !state.loadedPages.includes(previousPage - 1),
      }));
    } finally {
      set({ isLoadingPrevious: false });
    }
  },

  addTransactions: (transactions, page, meta) => {
    set((state) => ({
      transactions:
        page > state.currentPage
          ? [...state.transactions, ...transactions]
          : [...transactions, ...state.transactions],
      loadedPages: [...state.loadedPages, page],
      currentPage: page,
      hasMore: page < meta.last_page,
      hasPrevious: page > 1 && !state.loadedPages.includes(page - 1),
    }));
  },

  reset: () => {
    set({
      transactions: [],
      isLoading: false,
      isLoadingMore: false,
      isLoadingPrevious: false,
      hasMore: false,
      hasPrevious: false,
      currentPage: 1,
      loadedPages: [],
      error: null,
      filters: {},
    });
  },
});
