import { TransactionService } from "@/src/services/transaction-service";
import { CreateTransactionInput } from "@/src/types/transaction";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { getQueryClient } from "../lib/get-query-client";
import { startOfMonth, endOfMonth } from "date-fns";

export function useCreateTransaction() {
  const queryClient = getQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      new TransactionService().create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      router.refresh();
    },
  });
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

export function useTransactions() {
  const searchParams = useSearchParams();
  const { startDate, endDate } = getDateRangeFromParams(searchParams);
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");

  return useQuery({
    queryKey: [
      "transactions",
      searchParams.get("month"),
      searchParams.get("year"),
      categoryId,
      search,
    ],
    queryFn: async () => {
      const [transactions, summary] = await Promise.all([
        new TransactionService().findAllPaginated(
          startDate,
          endDate,
          categoryId,
          search || undefined
        ),
        new TransactionService().getSummary(
          startDate,
          endDate,
          categoryId,
          search || undefined
        ),
      ]);
      return {
        transactions,
        summary,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useUpdateTransaction() {
  const queryClient = getQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, ...data }: CreateTransactionInput & { id: string }) =>
      new TransactionService().update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      router.refresh();
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = getQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => new TransactionService().delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      router.refresh();
    },
  });
}

export function useTransactionSummary() {
  const searchParams = useSearchParams();
  const { startDate, endDate } = getDateRangeFromParams(searchParams);
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");

  return useQuery({
    queryKey: [
      "transactions",
      "summary",
      searchParams.get("month"),
      searchParams.get("year"),
      categoryId,
      search,
    ],
    queryFn: () =>
      new TransactionService().getSummary(
        startDate,
        endDate,
        categoryId,
        search || undefined
      ),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}
