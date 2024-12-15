"use client";

import { useState, useCallback } from "react";
import { useLazyCategories } from "@/hooks/queries/use-lazy-category";
import type { Category } from "@/types/category";

export function useCategoryLoader() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<Category["type"]>();
  const [isEnabled, setIsEnabled] = useState(false);

  const {
    data: categories = [],
    isLoading,
    prefetchForType,
  } = useLazyCategories({
    search,
    type: selectedType,
    enabled: isEnabled,
  });

  const loadCategories = useCallback(
    async (type?: Category["type"]) => {
      setIsEnabled(true);
      if (type) {
        setSelectedType(type);
        await prefetchForType(type);
      }
    },
    [prefetchForType]
  );

  const updateSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const updateType = useCallback((type: Category["type"]) => {
    setSelectedType(type);
  }, []);

  return {
    categories,
    isLoading,
    search,
    selectedType,
    loadCategories,
    updateSearch,
    updateType,
  };
}
