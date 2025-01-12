"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/features/categories/actions/categories";

export function useCategories(searchTerm?: string) {
  return useQuery({
    queryKey: ["categories", searchTerm ? { search: searchTerm } : undefined],
    queryFn: () => getCategories(searchTerm),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false, // Evita refetch ao focar na janela
  });
}
