"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CategoryService } from "@/services/category-service";
import type { Category } from "@/types/category";

const service = new CategoryService();

const STALE_TIME = 1000 * 60 * 5; // 5 minutes
const CACHE_TIME = 1000 * 60 * 30; // 30 minutes

export function useLazyCategories(options?: {
  search?: string;
  type?: Category["type"];
  enabled?: boolean;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["categories", options?.search, options?.type];

  const query = useQuery({
    queryKey,
    queryFn: () => service.search(options?.search, options?.type),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: options?.enabled ?? true,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Prefetch categories for a specific type
  const prefetchForType = async (type: Category["type"]) => {
    await queryClient.prefetchQuery({
      queryKey: ["categories", undefined, type],
      queryFn: () => service.search(undefined, type),
      staleTime: STALE_TIME,
    });
  };

  return {
    ...query,
    prefetchForType,
  };
}