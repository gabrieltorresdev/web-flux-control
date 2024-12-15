"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";
import { useStore } from "@/store";
import type { TransactionFilters } from "@/types/transaction";

export type Filters = TransactionFilters & {
  dateRange?: DateRange;
  categoryName?: string;
};

export function useFilterHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setFilters } = useStore();

  // Sincroniza os filtros da URL com o estado global
  useEffect(() => {
    const urlFilters: Filters = {
      page: searchParams.get("page") || "1",
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      categoryName: searchParams.get("categoryName") || undefined,
      type: (searchParams.get("type") as "income" | "expense") || undefined,
    };

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (startDate && endDate) {
      urlFilters.dateRange = {
        from: new Date(startDate),
        to: new Date(endDate),
      };
    }

    // Atualiza o estado global com os filtros da URL
    setFilters(urlFilters);
  }, [searchParams, setFilters]);

  const updateFilters = useCallback(
    (newFilters: Partial<Filters>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Handle date range separately
      if ("dateRange" in newFilters) {
        const dateRange = newFilters.dateRange;
        if (dateRange?.from && dateRange?.to) {
          params.set("startDate", dateRange.from.toISOString());
          params.set("endDate", dateRange.to.toISOString());
        } else {
          params.delete("startDate");
          params.delete("endDate");
        }
        delete newFilters.dateRange;
      }

      // Handle other filters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value.toString());
        } else {
          params.delete(key);
        }
      });

      // Update URL
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/");
  }, [router]);

  // Converte os parâmetros da URL em filtros com o formato adequado
  const filters = useMemo(() => {
    const entries = Array.from(searchParams.entries());
    const result: Record<string, any> = {};

    entries.forEach(([key, value]) => {
      // Ignora startDate e endDate pois serão tratados separadamente
      if (key !== "startDate" && key !== "endDate") {
        result[key] = value;
      }
    });

    // Converte startDate e endDate em dateRange se ambos existirem
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (startDate && endDate) {
      result.dateRange = {
        from: new Date(startDate),
        to: new Date(endDate),
      };
    }

    // Converte dateRange de volta para startDate e endDate
    if (result.dateRange) {
      result.startDate = result.dateRange.from.toISOString();
      result.endDate = result.dateRange.to.toISOString();
    }

    return result as Filters;
  }, [searchParams]);

  return {
    filters,
    updateFilters,
    clearFilters,
  };
}
