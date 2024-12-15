"use client";

import { useMemo } from "react";
import type { Category } from "@/types/category";
import type { TransactionInput } from "@/types/transaction";

export function useStepProgress(formData: Partial<TransactionInput>, selectedCategory?: Category) {
  const stepSummary = useMemo(() => {
    if (!formData.title) return null;

    return {
      title: formData.title,
      category: selectedCategory?.name,
      amount: formData.amount ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(formData.amount) : undefined,
      date: formData.date ? new Date(formData.date).toLocaleDateString("pt-BR") : undefined,
    };
  }, [formData, selectedCategory]);

  return {
    stepSummary,
  };
}