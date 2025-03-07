"use client";

import { useMonthFilterStore } from "@/shared/stores/month-filter-store";
import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useFilterNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { getAsQueryParams } = useMonthFilterStore();

  // Navega para qualquer rota adicionando automaticamente os filtros de mês/ano
  // Use useCallback para memoizar a função e evitar problemas de renderização
  const navigateWithFilters = useCallback(
    (targetPath?: string, options?: { preserveQuery?: boolean, additionalParams?: Record<string, string> }) => {
      // Se nenhum caminho for especificado, usa o caminho atual
      const path = targetPath || pathname;
      
      // Criar URLSearchParams com os filtros
      const searchParams = new URLSearchParams();
      
      // Adicionar mês e ano do store global
      const { month, year } = getAsQueryParams();
      searchParams.set("month", month);
      searchParams.set("year", year);
      
      // Adicionar parâmetros adicionais
      if (options?.additionalParams) {
        Object.entries(options.additionalParams).forEach(([key, value]) => {
          if (value) searchParams.set(key, value);
        });
      }
      
      // Navegar para a nova URL
      router.push(`${path}?${searchParams.toString()}`);
    },
    [pathname, router, getAsQueryParams]
  );

  return { navigateWithFilters };
} 