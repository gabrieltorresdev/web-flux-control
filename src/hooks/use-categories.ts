"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types/category";
import { getCategories } from "@/app/actions/categories";

interface CategoriesState {
  data: Category[];
  isLoading: boolean;
}

export function useCategoriesData(searchTerm?: string) {
  const [state, setState] = useState<CategoriesState>({
    data: [],
    isLoading: true,
  });

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function fetchData() {
      try {
        const result = await getCategories(searchTerm);
        if (!ignore) {
          setState({
            data: result.data,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        if (!ignore) {
          setState({
            data: [],
            isLoading: false,
          });
        }
      }
    }

    setState((prev) => ({ ...prev, isLoading: true }));
    fetchData();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [searchTerm]);

  return state;
}
