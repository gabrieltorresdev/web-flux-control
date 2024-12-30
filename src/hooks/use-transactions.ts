"use client";

import { TransactionService } from "@/services/transaction-service";
import {
  CreateTransactionInput,
  PaginationParams,
  ApiTransactionPaginatedList,
  Transaction,
} from "@/types/transaction";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { queryKeys, getQueryClient } from "../lib/get-query-client";
import { startOfMonth, endOfMonth } from "date-fns";
import { QueryClient } from "@tanstack/react-query";
import {
  handleValidationError,
  ValidationError,
} from "@/lib/api/error-handler";

const TRANSACTIONS_QUERY_KEY = queryKeys.transactions.all;
const STALE_TIME = 30 * 1000;
const GC_TIME = 5 * 60 * 1000;
const DEFAULT_PAGE_SIZE = 10;

interface TransactionQueryData {
  pages: Array<{
    transactions: ApiTransactionPaginatedList;
    nextPage?: number;
  }>;
}

interface MutationContext {
  previousData: [readonly unknown[], TransactionQueryData | undefined][];
}

interface PrefetchNextPageParams {
  queryClient: QueryClient;
  queryKey: readonly unknown[];
  transactionService: TransactionService;
  startDate: Date;
  endDate: Date;
  categoryId: string | null;
  search: string | null;
  pagination: PaginationParams;
  nextPage: number;
}

const handleMutationError = async (error: unknown) => {
  if (!(error instanceof Error && error.name === "ApiError")) {
    throw error;
  }

  const apiError = error as { status?: number; message: string };
  if (apiError.status !== 422) {
    throw error;
  }

  throw new ValidationError({
    message: apiError.message,
    errors: {
      dateTime: [apiError.message],
    },
  });
};

const getDateRangeFromParams = (searchParams: URLSearchParams) => {
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");
  const now = new Date();

  const month = monthParam ? parseInt(monthParam) - 1 : now.getMonth();
  const year = yearParam ? parseInt(yearParam) : now.getFullYear();
  const date = new Date(year, month);

  return {
    startDate: startOfMonth(date),
    endDate: endOfMonth(date),
  };
};

const useTransactionQueries = (
  startDate: Date,
  endDate: Date,
  categoryId: string | null,
  search: string | null,
  initialPagination?: PaginationParams
) => {
  console.log("useTransactionQueries called with:", {
    startDate,
    endDate,
    categoryId,
    search,
    initialPagination,
  });

  const queryClient = getQueryClient();

  const queryKey = queryKeys.transactions.list({
    month: startDate.getMonth() + 1,
    year: startDate.getFullYear(),
    categoryId,
    search,
  });

  console.log("Query key generated:", queryKey);

  const summaryQueryKey = queryKeys.transactions.summary({
    month: startDate.getMonth() + 1,
    year: startDate.getFullYear(),
    categoryId,
    search,
  });

  const transactionService = new TransactionService();

  const summaryQuery = useQuery({
    queryKey: summaryQueryKey,
    queryFn: async () => {
      console.log("summaryQuery queryFn called");
      try {
        const result = await transactionService.getSummary(
          startDate,
          endDate,
          categoryId,
          search || undefined
        );
        console.log("summaryQuery result:", result);
        return result;
      } catch (error) {
        console.error("summaryQuery error:", error);
        await handleMutationError(error);
        throw error;
      }
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  const transactionsQuery = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      console.log(
        "transactionsQuery queryFn called with pageParam:",
        pageParam
      );
      try {
        const pagination = {
          page: pageParam,
          perPage: initialPagination?.perPage || DEFAULT_PAGE_SIZE,
        };

        console.log("Fetching transactions with pagination:", pagination);
        const transactions = await transactionService.findAllPaginated(
          startDate,
          endDate,
          categoryId,
          search || undefined,
          pagination
        );
        console.log("Transactions fetched:", transactions);

        if (transactions.meta.current_page < transactions.meta.last_page) {
          await prefetchNextPage({
            queryClient,
            queryKey,
            transactionService,
            startDate,
            endDate,
            categoryId,
            search,
            pagination,
            nextPage: transactions.meta.current_page + 1,
          });
        }

        return {
          transactions,
          nextPage:
            transactions.meta.current_page < transactions.meta.last_page
              ? transactions.meta.current_page + 1
              : undefined,
        };
      } catch (error) {
        console.error("transactionsQuery error:", error);
        await handleMutationError(error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      console.log("getNextPageParam called with:", lastPage);
      if (!lastPage?.transactions?.meta) return undefined;
      return lastPage.nextPage;
    },
    initialPageParam: 1,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  console.log("Queries state:", {
    summaryQuery: {
      isLoading: summaryQuery.isLoading,
      isError: summaryQuery.isError,
      error: summaryQuery.error,
    },
    transactionsQuery: {
      isLoading: transactionsQuery.isLoading,
      isError: transactionsQuery.isError,
      error: transactionsQuery.error,
      hasNextPage: transactionsQuery.hasNextPage,
    },
  });

  return { summaryQuery, transactionsQuery };
};

// Main hooks
export function useTransactions(initialPagination?: PaginationParams) {
  const searchParams = useSearchParams();
  const { startDate, endDate } = getDateRangeFromParams(searchParams);
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");

  const { summaryQuery, transactionsQuery } = useTransactionQueries(
    startDate,
    endDate,
    categoryId,
    search,
    initialPagination
  );

  const aggregatedData = {
    transactions: {
      data:
        transactionsQuery.data?.pages.flatMap(
          (page) => page.transactions.data
        ) ?? [],
      meta: transactionsQuery.data?.pages[0]?.transactions.meta || {
        current_page: 0,
        last_page: 0,
        perPage: 0,
        total: 0,
        from: 0,
        to: 0,
      },
    },
    summary: summaryQuery.data || {
      data: { income: 0, expense: 0, total: 0 },
    },
  };

  const refetch = async () => {
    await Promise.all([transactionsQuery.refetch(), summaryQuery.refetch()]);
  };

  return {
    data: aggregatedData,
    isLoading: transactionsQuery.isLoading || summaryQuery.isLoading,
    isFetching: transactionsQuery.isFetching,
    hasNextPage: transactionsQuery.hasNextPage,
    fetchNextPage: transactionsQuery.fetchNextPage,
    isFetchingNextPage: transactionsQuery.isFetchingNextPage,
    isError: transactionsQuery.isError || summaryQuery.isError,
    error: transactionsQuery.error || summaryQuery.error,
    refetch,
  };
}

// Mutation hooks with optimistic updates
export function useCreateTransaction() {
  const queryClient = getQueryClient();
  const router = useRouter();

  return useMutation<
    Transaction,
    ValidationError | Error,
    CreateTransactionInput,
    MutationContext
  >({
    mutationFn: async (data) => {
      try {
        const result = await new TransactionService().create(data);
        return result as Transaction;
      } catch (error) {
        throw handleValidationError(error);
      }
    },
    retry: (_, error) => {
      return !(error instanceof ValidationError);
    },
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: TRANSACTIONS_QUERY_KEY });

      const previousData = queryClient.getQueriesData({
        queryKey: TRANSACTIONS_QUERY_KEY,
      }) as [readonly unknown[], TransactionQueryData | undefined][];

      try {
        queryClient.setQueriesData<TransactionQueryData>(
          { queryKey: TRANSACTIONS_QUERY_KEY },
          (old) => {
            if (!old?.pages?.length) return old;

            return {
              ...old,
              pages: old.pages.map((page, index) => {
                if (index === 0) {
                  return {
                    ...page,
                    transactions: {
                      ...page.transactions,
                      data: [
                        {
                          ...newTransaction,
                          id: "temp-id",
                          category: {
                            id: "",
                            name: "",
                            type: "expense",
                            is_default: false,
                            created_at: new Date(),
                            updated_at: new Date(),
                          },
                        } as unknown as Transaction,
                        ...page.transactions.data,
                      ],
                      meta: {
                        ...page.transactions.meta,
                        total: page.transactions.meta.total + 1,
                      },
                    },
                  };
                }
                return page;
              }),
            };
          }
        );

        return { previousData };
      } catch (error) {
        console.error("Error during optimistic update:", error);
        return { previousData };
      }
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, previousValue]) => {
          queryClient.setQueryData(queryKey, previousValue);
        });
      }
    },
    onSuccess: async () => {
      await queryClient.resetQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      router.refresh();
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = getQueryClient();
  const router = useRouter();

  return useMutation<
    Transaction,
    ValidationError | Error,
    { id: string } & CreateTransactionInput,
    MutationContext
  >({
    mutationFn: async ({ id, ...data }) => {
      try {
        const result = await new TransactionService().update(id, data);
        return result as Transaction;
      } catch (error) {
        throw handleValidationError(error);
      }
    },
    retry: (_, error) => {
      return !(error instanceof ValidationError);
    },
    onMutate: async ({ id, ...updatedTransaction }) => {
      await queryClient.cancelQueries({ queryKey: TRANSACTIONS_QUERY_KEY });

      const previousData = queryClient.getQueriesData({
        queryKey: TRANSACTIONS_QUERY_KEY,
      }) as [readonly unknown[], TransactionQueryData | undefined][];

      try {
        queryClient.setQueriesData<TransactionQueryData>(
          { queryKey: TRANSACTIONS_QUERY_KEY },
          (old) => {
            if (!old?.pages?.length) return old;

            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                transactions: {
                  ...page.transactions,
                  data: page.transactions.data.map((t) =>
                    t.id === id
                      ? {
                          ...t,
                          ...updatedTransaction,
                          category: t.category,
                        }
                      : t
                  ),
                },
              })),
            };
          }
        );

        return { previousData };
      } catch (error) {
        console.error("Error during optimistic update:", error);
        return { previousData };
      }
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, previousValue]) => {
          queryClient.setQueryData(queryKey, previousValue);
        });
      }
    },
    onSuccess: async () => {
      await queryClient.resetQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      router.refresh();
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = getQueryClient();
  const router = useRouter();

  return useMutation<void, ValidationError | Error, string, MutationContext>({
    mutationFn: async (id) => {
      try {
        await new TransactionService().delete(id);
      } catch (error) {
        await handleMutationError(error);
        throw error;
      }
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: TRANSACTIONS_QUERY_KEY });

      const previousData = queryClient.getQueriesData({
        queryKey: TRANSACTIONS_QUERY_KEY,
      }) as [readonly unknown[], TransactionQueryData | undefined][];

      try {
        queryClient.setQueriesData<TransactionQueryData>(
          { queryKey: TRANSACTIONS_QUERY_KEY },
          (old) => {
            if (!old?.pages?.length) return old;

            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                transactions: {
                  ...page.transactions,
                  data: page.transactions.data.filter(
                    (t) => t.id !== deletedId
                  ),
                  meta: {
                    ...page.transactions.meta,
                    total: page.transactions.meta.total - 1,
                  },
                },
              })),
            };
          }
        );

        return { previousData };
      } catch (error) {
        console.error("Error during optimistic update:", error);
        return { previousData };
      }
    },
    onError: (error, variables, context) => {
      console.log("onError called with context:", context);
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, previousValue]) => {
          queryClient.setQueryData(queryKey, previousValue);
        });
      }
    },
    onSuccess: async () => {
      await queryClient.resetQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      router.refresh();
    },
  });
}

// Utility functions for mutations
const prefetchNextPage = async ({
  queryClient,
  queryKey,
  transactionService,
  startDate,
  endDate,
  categoryId,
  search,
  pagination,
  nextPage,
}: PrefetchNextPageParams) => {
  void queryClient.prefetchInfiniteQuery({
    queryKey,
    queryFn: async () => {
      const nextTransactions = await transactionService.findAllPaginated(
        startDate,
        endDate,
        categoryId,
        search || undefined,
        { ...pagination, page: nextPage }
      );

      return {
        transactions: nextTransactions,
        nextPage:
          nextTransactions.meta.current_page < nextTransactions.meta.last_page
            ? nextTransactions.meta.current_page + 1
            : undefined,
      };
    },
    initialPageParam: nextPage,
  });
};
