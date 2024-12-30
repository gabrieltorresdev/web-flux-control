import { QueryClient, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "../get-query-client";
import { CategoryService } from "@/services/category-service";
import { TransactionService } from "@/services/transaction-service";
import { queryKeys } from "../get-query-client";
import { startOfMonth, endOfMonth } from "date-fns";

type PrefetchOptions = {
  queryClient?: QueryClient;
};

export async function prefetchCategories(options?: PrefetchOptions) {
  const queryClient = options?.queryClient || getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => new CategoryService().findAllPaginated(),
  });

  return queryClient;
}

export async function prefetchTransactions(
  month?: number,
  year?: number,
  categoryId?: string,
  search?: string,
  options?: PrefetchOptions
) {
  const queryClient = options?.queryClient || getQueryClient();

  const date = new Date(
    year || new Date().getFullYear(),
    month !== undefined ? month - 1 : new Date().getMonth()
  );
  const startDate = startOfMonth(date);
  const endDate = endOfMonth(date);

  // Prefetch summary separately
  await queryClient.prefetchQuery({
    queryKey: queryKeys.transactions.summary({
      month,
      year,
      categoryId,
      search,
    }),
    queryFn: () =>
      new TransactionService().getSummary(
        startDate,
        endDate,
        categoryId,
        search
      ),
  });

  // Prefetch transactions
  await queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.transactions.list({ month, year, categoryId, search }),
    queryFn: async ({ pageParam = 1 }) => {
      const transactions = await new TransactionService().findAllPaginated(
        startDate,
        endDate,
        categoryId,
        search,
        { page: pageParam, perPage: 10 }
      );

      return {
        transactions,
        nextPage:
          transactions.meta.current_page < transactions.meta.last_page
            ? transactions.meta.current_page + 1
            : undefined,
      };
    },
    initialPageParam: 1,
  });

  return queryClient;
}

export function getDehydratedState(queryClient: QueryClient) {
  return dehydrate(queryClient);
}
