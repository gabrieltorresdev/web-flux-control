import { TransactionService } from "@/src/services/transaction-service";
import {
  CreateTransactionInput,
  PaginationParams,
  ApiTransactionPaginatedList,
  ApiTransactionSummaryResponse,
  Transaction,
} from "@/src/types/transaction";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { queryKeys } from "../lib/get-query-client";
import { startOfMonth, endOfMonth } from "date-fns";

type TransactionQueryData = {
  pages: Array<{
    transactions: ApiTransactionPaginatedList;
    summary: ApiTransactionSummaryResponse;
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

  const transactionsQuery = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const pagination: PaginationParams = {
        page: pageParam,
        per_page: initialPagination?.per_page || 10,
      };

      const [transactions, summary] = await Promise.all([
        new TransactionService().findAllPaginated(
          startDate,
          endDate,
          categoryId,
          search || undefined,
          pagination
        ),
        new TransactionService().getSummary(
          startDate,
          endDate,
          categoryId,
          search || undefined
        ),
      ]);

      // Prefetch próxima página
      if (transactions.meta.current_page < transactions.meta.last_page) {
        const nextPage = transactions.meta.current_page + 1;
        queryClient.prefetchInfiniteQuery({
          queryKey,
          queryFn: async () => {
            const [nextTransactions, nextSummary] = await Promise.all([
              new TransactionService().findAllPaginated(
                startDate,
                endDate,
                categoryId,
                search || undefined,
                { ...pagination, page: nextPage }
              ),
              new TransactionService().getSummary(
                startDate,
                endDate,
                categoryId,
                search || undefined
              ),
            ]);
            return {
              transactions: nextTransactions,
              summary: nextSummary,
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
        summary,
        nextPage:
          transactions.meta.current_page < transactions.meta.last_page
            ? transactions.meta.current_page + 1
            : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  const aggregatedData = transactionsQuery.data?.pages.reduce<{
    transactions: ApiTransactionPaginatedList;
    summary: ApiTransactionSummaryResponse;
  }>(
    (acc, page) => ({
      transactions: {
        data: [...acc.transactions.data, ...page.transactions.data],
        meta: page.transactions.meta,
      },
      summary: page.summary,
    }),
    {
      transactions: {
        data: [],
        meta: transactionsQuery.data?.pages[0]?.transactions.meta || {
          current_page: 0,
          last_page: 0,
          per_page: 0,
          total: 0,
          from: 0,
          to: 0,
        },
      },
      summary: transactionsQuery.data?.pages[0]?.summary || {
        data: { income: 0, expense: 0, total: 0 },
      },
    }
  );

  return {
    data: aggregatedData,
    isLoading: transactionsQuery.isLoading,
    isFetching: transactionsQuery.isFetching,
    hasNextPage: transactionsQuery.hasNextPage,
    fetchNextPage: transactionsQuery.fetchNextPage,
    isFetchingNextPage: transactionsQuery.isFetchingNextPage,
    isError: transactionsQuery.isError,
    refetch: transactionsQuery.refetch,
  };
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      new TransactionService().create(data),
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: TRANSACTIONS_QUERY_KEY });

      const previousData = queryClient.getQueriesData<TransactionQueryData>({
        queryKey: TRANSACTIONS_QUERY_KEY,
      });

      const updater: QueryUpdater = (old) =>
        updateQueryData(old, (page) => {
          const isIncome = newTransaction.categoryId.startsWith("income");
          const amount = newTransaction.amount;

          const optimisticTransaction: Transaction = {
            id: "temp-" + Date.now(),
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
            summary: {
              data: {
                income: page.summary.data.income + (isIncome ? amount : 0),
                expense: page.summary.data.expense + (!isIncome ? amount : 0),
                total: page.summary.data.total + (isIncome ? amount : -amount),
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
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      router.refresh();
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & CreateTransactionInput) =>
      new TransactionService().update(id, data),
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
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      router.refresh();
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => new TransactionService().delete(id),
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
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      router.refresh();
    },
  });
}
