"use client";

import { useQuery } from "@tanstack/react-query";
import { CategoryService } from "@/services/category-service";
import type { Category } from "@/types/category";

const service = new CategoryService();

export function useCategoryQuery(search?: string, type?: Category["type"]) {
  return useQuery({
    queryKey: ["categories", search, type],
    queryFn: () => service.search(search, type),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCategoryList() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => service.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}