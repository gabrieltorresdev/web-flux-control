import { TransactionService } from "@/src/services/transaction-service";
import {
  CreateTransactionInput,
  PaginationParams,
  ApiTransactionPaginatedList,
  Transaction,
} from "@/src/types/transaction";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { queryKeys } from "../lib/get-query-client";
import { startOfMonth, endOfMonth } from "date-fns";

type TransactionQueryData = {
  pages: Array<{
    transactions: ApiTransactionPaginatedList;
    nextPage?: number;
  }>;
};

type QueryUpdater = (
  old: TransactionQueryData | undefined
) => TransactionQueryData | undefined;

function updateQueryData(
  old: TransactionQueryData | undefined,
  updater: (
    page: TransactionQueryData["pages"][0]
  ) => TransactionQueryData["pages"][0]
): TransactionQueryData | undefined {
  if (!old?.pages) return old;
  return {
    ...old,
    pages: old.pages.map((page, index) => (index === 0 ? updater(page) : page)),
  };
}

function getDateRangeFromParams(searchParams: URLSearchParams): {
  startDate?: Date;
  endDate?: Date;
} {
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");

  if (!monthParam || !yearParam) {
    const now = new Date();
    const month = monthParam ? parseInt(monthParam) - 1 : now.getMonth();
    const year = yearParam ? parseInt(yearParam) : now.getFullYear();

    const date = new Date(year, month);
    return {
      startDate: startOfMonth(date),
      endDate: endOfMonth(date),
    };
  }

  const date = new Date(parseInt(yearParam), parseInt(monthParam) - 1);
  return {
    startDate: startOfMonth(date),
    endDate: endOfMonth(date),
  };
}

type MutationContext = {
  previousData: [readonly unknown[], TransactionQueryData | undefined][];
};

const TRANSACTIONS_QUERY_KEY = queryKeys.transactions.all;
const STALE_TIME = 30 * 1000; // 30 seconds
const GC_TIME = 5 * 60 * 1000; // 5 minutes

export function useTransactions(initialPagination?: PaginationParams) {
  const searchParams = useSearchParams();
  const { startDate, endDate } = getDateRangeFromParams(searchParams);
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");
  const queryClient = useQueryClient();

  const queryKey = queryKeys.transactions.list({
    month: searchParams.get("month"),
    year: searchParams.get("year"),
    categoryId,
    search,
  });

  const summaryQueryKey = queryKeys.transactions.summary({
    month: searchParams.get("month"),
    year: searchParams.get("year"),
    categoryId,
    search,
  });

  const summaryQuery = useQuery({
    queryKey: summaryQueryKey,
    queryFn: () =>
      new TransactionService().getSummary(
        startDate,
        endDate,
        categoryId,
        search || undefined
      ),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  const transactionsQuery = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const pagination: PaginationParams = {
        page: pageParam,
        perPage: initialPagination?.perPage || 10,
      };

      const transactions = await new TransactionService().findAllPaginated(
        startDate,
        endDate,
        categoryId,
        search || undefined,
        pagination
      );

      if (transactions.meta.current_page < transactions.meta.last_page) {
        const nextPage = transactions.meta.current_page + 1;
        void queryClient.prefetchInfiniteQuery({
          queryKey,
          queryFn: async () => {
            const nextTransactions =
              await new TransactionService().findAllPaginated(
                startDate,
                endDate,
                categoryId,
                search || undefined,
                { ...pagination, page: nextPage }
              );
            return {
              transactions: nextTransactions,
              nextPage:
                nextTransactions.meta.current_page <
                nextTransactions.meta.last_page
                  ? nextTransactions.meta.current_page + 1
                  : undefined,
            };
          },
          initialPageParam: nextPage,
        });
      }

      return {
        transactions,
        nextPage:
          transactions.meta.current_page < transactions.meta.last_page
            ? transactions.meta.current_page + 1
            : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

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

  return {
    data: aggregatedData,
    isLoading: transactionsQuery.isLoading || summaryQuery.isLoading,
    isFetching: transactionsQuery.isFetching,
    hasNextPage: transactionsQuery.hasNextPage,
    fetchNextPage: transactionsQuery.fetchNextPage,
    isFetchingNextPage: transactionsQuery.isFetchingNextPage,
    isError: transactionsQuery.isError || summaryQuery.isError,
    error: transactionsQuery.error || summaryQuery.error,
    refetch: () => {
      void transactionsQuery.refetch();
      void summaryQuery.refetch();
    },
  };
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateTransactionInput) =>
      await new TransactionService().create(data),
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: TRANSACTIONS_QUERY_KEY });

      const previousData = queryClient.getQueriesData<TransactionQueryData>({
        queryKey: TRANSACTIONS_QUERY_KEY,
      });

      const updater: QueryUpdater = (old) =>
        updateQueryData(old, (page) => {
          const isIncome = newTransaction.categoryId.startsWith("income");
          const optimisticTransaction: Transaction = {
            id: `temp-${Date.now()}`,
            title: newTransaction.title,
            dateTime: newTransaction.dateTime,
            amount: newTransaction.amount,
            category: {
              id: newTransaction.categoryId,
              name: isIncome ? "Receita" : "Despesa",
              type: isIncome ? "income" : "expense",
              is_default: false,
            },
          };

          return {
            ...page,
            transactions: {
              ...page.transactions,
              data: [optimisticTransaction, ...page.transactions.data],
              meta: {
                ...page.transactions.meta,
                total: page.transactions.meta.total + 1,
              },
            },
          };
        });

      queryClient.setQueriesData<TransactionQueryData>(
        { queryKey: TRANSACTIONS_QUERY_KEY },
        updater
      );

      return { previousData };
    },
    onError: (err, newTransaction, context: MutationContext | undefined) => {
      if (context?.previousData) {
        queryClient.setQueriesData(
          { queryKey: TRANSACTIONS_QUERY_KEY },
          context.previousData
        );
      }
    },
    onSettled: () => {
      void queryClient.resetQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      router.refresh();
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string } & CreateTransactionInput) =>
      await new TransactionService().update(id, data),
    onMutate: async ({ id, ...updatedTransaction }) => {
      await queryClient.cancelQueries({ queryKey: TRANSACTIONS_QUERY_KEY });

      const previousData = queryClient.getQueriesData<TransactionQueryData>({
        queryKey: TRANSACTIONS_QUERY_KEY,
      });

      const updater: QueryUpdater = (old) =>
        updateQueryData(old, (page) => ({
          ...page,
          transactions: {
            ...page.transactions,
            data: page.transactions.data.map((transaction) =>
              transaction.id === id
                ? {
                    ...transaction,
                    ...updatedTransaction,
                    category: {
                      ...(transaction.category || {
                        name: "",
                        type: "expense",
                        is_default: false,
                      }),
                      id: updatedTransaction.categoryId,
                    },
                  }
                : transaction
            ),
          },
        }));

      queryClient.setQueriesData<TransactionQueryData>(
        { queryKey: TRANSACTIONS_QUERY_KEY },
        updater
      );

      return { previousData };
    },
    onError: (
      err,
      updatedTransaction,
      context: MutationContext | undefined
    ) => {
      if (context?.previousData) {
        queryClient.setQueriesData(
          { queryKey: TRANSACTIONS_QUERY_KEY },
          context.previousData
        );
      }
    },
    onSettled: () => {
      void queryClient.resetQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      router.refresh();
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string) => await new TransactionService().delete(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: TRANSACTIONS_QUERY_KEY });

      const previousData = queryClient.getQueriesData<TransactionQueryData>({
        queryKey: TRANSACTIONS_QUERY_KEY,
      });

      const updater: QueryUpdater = (old) =>
        updateQueryData(old, (page) => ({
          ...page,
          transactions: {
            ...page.transactions,
            data: page.transactions.data.filter(
              (transaction) => transaction.id !== deletedId
            ),
            meta: {
              ...page.transactions.meta,
              total: page.transactions.meta.total - 1,
            },
          },
        }));

      queryClient.setQueriesData<TransactionQueryData>(
        { queryKey: TRANSACTIONS_QUERY_KEY },
        updater
      );

      return { previousData };
    },
    onError: (err, deletedId, context: MutationContext | undefined) => {
      if (context?.previousData) {
        queryClient.setQueriesData(
          { queryKey: TRANSACTIONS_QUERY_KEY },
          context.previousData
        );
      }
    },
    onSettled: () => {
      void queryClient.resetQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      router.refresh();
    },
  });
}
