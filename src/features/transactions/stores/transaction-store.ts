import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Transaction } from "@/features/transactions/types";
import { getTransactionsList } from "@/features/transactions/actions/transactions";
import { groupTransactionsByDate } from "@/features/transactions/utils/transactions";

interface TransactionFilters {
  month?: number;
  year?: number;
  categoryId?: string;
  search?: string;
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  currentPage: number;
  hasNextPage: boolean;
  filters: TransactionFilters;
  error: string | null;
}

interface CreateStoreProps {
  initialData?: {
    transactions: Transaction[];
    hasNextPage: boolean;
  };
}

interface TransactionActions {
  setTransactions: (transactions: Transaction[]) => void;
  appendTransactions: (transactions: Transaction[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setCurrentPage: (page: number) => void;
  setHasNextPage: (hasNext: boolean) => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  setError: (error: string | null) => void;
  fetchTransactions: (page?: number, perPage?: number) => Promise<void>;
  initializeFromServer: (data: {
    transactions: Transaction[];
    hasNextPage: boolean;
  }) => void;
  reset: () => void;
}

export const createTransactionStore = ({
  initialData,
}: CreateStoreProps = {}) => {
  const defaultState: TransactionState = {
    transactions: initialData?.transactions || [],
    isLoading: false,
    currentPage: 1,
    hasNextPage: initialData?.hasNextPage || false,
    filters: {},
    error: null,
  };

  return create<TransactionState & TransactionActions>()(
    persist(
      (set, get) => ({
        ...defaultState,

        setTransactions: (transactions) => set({ transactions }),
        appendTransactions: (newTransactions) =>
          set((state) => ({
            transactions: [...state.transactions, ...newTransactions],
          })),
        setIsLoading: (isLoading) => set({ isLoading }),
        setCurrentPage: (page) => set({ currentPage: page }),
        setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),
        setFilters: (filters) =>
          set((state) => ({ filters: { ...state.filters, ...filters } })),
        setError: (error) => set({ error }),

        initializeFromServer: (data) => {
          set({
            transactions: data.transactions,
            hasNextPage: data.hasNextPage,
            currentPage: 1,
            isLoading: false,
            error: null,
          });
        },

        fetchTransactions: async (page = 1, perPage = 10) => {
          const state = get();
          if (state.isLoading) return;

          try {
            set({ isLoading: true, error: null });
            const response = await getTransactionsList({
              ...state.filters,
              page,
              perPage,
            });

            if (page === 1) {
              set({ transactions: response.transactions.data });
            } else {
              set((state) => ({
                transactions: [
                  ...state.transactions,
                  ...response.transactions.data,
                ],
              }));
            }

            set({
              currentPage: page,
              hasNextPage: Boolean(response.nextPage),
              isLoading: false,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch transactions";
            set({
              error: errorMessage,
              isLoading: false,
            });
          }
        },

        reset: () => set(defaultState),
      }),
      {
        name: "transaction-store",
        partialize: (state) => ({
          filters: state.filters,
        }),
      }
    )
  );
};

// Optimized selectors factory
export const createTransactionSelectors =
  (store: ReturnType<typeof createTransactionStore>) => () => {
    const transactions = store((state) => state.transactions);
    const filters = store((state) => state.filters);
    const isLoading = store((state) => state.isLoading);
    const hasNextPage = store((state) => state.hasNextPage);
    const currentPage = store((state) => state.currentPage);
    const error = store((state) => state.error);

    return {
      transactions,
      filters,
      isLoading,
      hasNextPage,
      currentPage,
      error,
      // Memoized grouped transactions
      groupedTransactions: groupTransactionsByDate(transactions),
    };
  };

// Create the default store and selectors
export const useTransactionStore = createTransactionStore();
export const useTransactionSelectors =
  createTransactionSelectors(useTransactionStore);
