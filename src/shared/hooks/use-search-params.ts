"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useQueryParams<T>() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get a specific param
  const getParam = useCallback(
    (key: keyof T) => {
      return searchParams.get(String(key));
    },
    [searchParams]
  );

  // Set a new value for a param
  const setParam = useCallback(
    (key: keyof T, value: string | null) => {
      const params = new URLSearchParams(searchParams);

      if (value === null) {
        params.delete(String(key));
      } else {
        params.set(String(key), value);
      }

      // Preserve existing params and update only the specified one
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  // Get all params as an object
  const getParams = useCallback(() => {
    const params: Partial<T> = {};
    searchParams.forEach((value, key) => {
      (params as Record<string, string>)[key] = value;
    });
    return params;
  }, [searchParams]);

  return {
    getParam,
    setParam,
    getParams,
  };
}
