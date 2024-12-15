"use client";

import { useQuery } from "@tanstack/react-query";
import { TransactionService } from "@/services/transaction-service";
import type { TransactionFilters } from "@/types/transaction";

const service = new TransactionService();

export function useTransactionQuery(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => service.getAll(filters),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useTransactionSummaryQuery(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["transaction-summary", startDate, endDate],
    queryFn: () => {
      if (!startDate || !endDate) {
        return Promise.resolve({
          income: 0,
          expense: 0,
          total: 0,
        });
      }
      return service.getSummary(startDate, endDate);
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: Boolean(startDate && endDate),
  });
}