"use client";

import { TransactionService } from "@/features/transactions/services/transaction-service";
import {
  CreateTransactionInput,
  Transaction,
} from "@/features/transactions/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys, getQueryClient } from "@/shared/lib/get-query-client";
import { ValidationError } from "@/shared/lib/api/error-handler";
import { useEffect, useState, useTransition } from "react";

const TRANSACTIONS_QUERY_KEY = queryKeys.transactions.all;

interface MutationContext {
  previousData: [readonly unknown[], unknown][];
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

// Main hooks
export function useTransactions() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const setLoading = (loading: boolean) => {
    if (typeof window !== "undefined") {
      setIsLoading(loading);
    }
  };

  useEffect(() => {
    if (isPending) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [isPending]);

  return {
    isLoading: isLoading || isPending,
    setLoading,
    startTransition,
  };
}

// Mutation hooks with optimistic updates
function useCreateTransaction() {
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
        throw handleMutationError(error);
      }
    },
    retry: (_, error) => {
      return !(error instanceof ValidationError);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: TRANSACTIONS_QUERY_KEY });

      const previousData = queryClient.getQueriesData({
        queryKey: TRANSACTIONS_QUERY_KEY,
      }) as [readonly unknown[], unknown][];

      try {
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

function useUpdateTransaction() {
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
        throw handleMutationError(error);
      }
    },
    retry: (_, error) => {
      return !(error instanceof ValidationError);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: TRANSACTIONS_QUERY_KEY });

      const previousData = queryClient.getQueriesData({
        queryKey: TRANSACTIONS_QUERY_KEY,
      }) as [readonly unknown[], unknown][];

      try {
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

function useDeleteTransaction() {
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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: TRANSACTIONS_QUERY_KEY });

      const previousData = queryClient.getQueriesData({
        queryKey: TRANSACTIONS_QUERY_KEY,
      }) as [readonly unknown[], unknown][];

      try {
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
