"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/app/actions/categories";
import { queryKeys } from "@/lib/get-query-client";

export function useCategories(searchTerm?: string) {
  return useQuery({
    queryKey: queryKeys.categories.list(
      searchTerm ? { search: searchTerm } : undefined
    ),
    queryFn: () => getCategories(searchTerm),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false, // Evita refetch ao focar na janela
  });
}
