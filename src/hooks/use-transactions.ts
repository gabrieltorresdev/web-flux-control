import { TransactionService } from "@/src/services/transaction-service";
import { CreateTransactionInput } from "@/src/types/transaction";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      new TransactionService().create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useTransactions(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: [
      "transactions",
      startDate?.toISOString(),
      endDate?.toISOString(),
    ],
    queryFn: () =>
      new TransactionService().findAllPaginated(startDate, endDate),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: CreateTransactionInput & { id: string }) =>
      new TransactionService().update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => new TransactionService().delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useTransactionSummary(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: [
      "transactions",
      "summary",
      startDate?.toISOString(),
      endDate?.toISOString(),
    ],
    queryFn: () => new TransactionService().getSummary(startDate, endDate),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}
