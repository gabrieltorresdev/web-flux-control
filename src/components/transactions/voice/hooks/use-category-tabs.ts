"use client";

import { useState, useCallback, useMemo } from "react";
import type { Category } from "@/types/category";

export function useCategoryTabs(categories: Category[]) {
  const [activeTab, setActiveTab] = useState<"income" | "expense">("expense");

  const incomeCategories = useMemo(() => 
    categories.filter((c) => c.type === "income"),
    [categories]
  );

  const expenseCategories = useMemo(() => 
    categories.filter((c) => c.type === "expense"),
    [categories]
  );

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as "income" | "expense");
  }, []);

  return {
    activeTab,
    incomeCategories,
    expenseCategories,
    handleTabChange,
  };
}