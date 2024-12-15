"use client";

import { useCallback, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TransactionFilters } from "@/types/transaction";

export function useTransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const currentFilters: TransactionFilters = {
    page: searchParams.get("page") || "1",
    categoryId: searchParams.get("categoryId") || undefined,
    type: (searchParams.get("type") as "income" | "expense") || undefined,
    search: searchParams.get("search") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
  };

  const updateFilters = useCallback(
    async (filters: Partial<TransactionFilters>) => {
      try {
        setIsApplyingFilters(true);
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.set(key, value.toString());
          } else {
            params.delete(key);
          }
        });

        // Reset page when filters change (except when explicitly setting page)
        if (!filters.page) {
          params.delete("page");
        }

        router.push(`?${params.toString()}`);
      } finally {
        setIsApplyingFilters(false);
      }
    },
    [router, searchParams]
  );

  return {
    filters: currentFilters,
    updateFilters,
    isApplyingFilters,
  };
}
