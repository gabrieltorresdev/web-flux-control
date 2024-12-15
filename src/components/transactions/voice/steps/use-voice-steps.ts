"use client";

import { useState, useCallback } from "react";
import { TitleStep } from "./title-step";
import { CategoryStep } from "./category-step";
import { AmountStep } from "./amount-step";
import { DateStep } from "./date-step";
import type { Step } from "./types";
import type { Category } from "@/types/category";
import type { TransactionInput } from "@/types/transaction";

export function useVoiceSteps(categories: Category[]) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<TransactionInput>>({});

  const steps: Step[] = [
    {
      id: "title",
      title: "Título",
      question: "Qual o título da transação?",
      component: TitleStep,
    },
    {
      id: "category",
      title: "Categoria",
      question: "Selecione a categoria da transação",
      component: CategoryStep,
    },
    {
      id: "amount",
      title: "Valor",
      question: "Qual o valor da transação?",
      component: AmountStep,
    },
    {
      id: "date",
      title: "Data",
      question: "Quando foi realizada a transação? (Ex: hoje, ontem, última segunda-feira, 31 de março)",
      component: DateStep,
    },
  ];

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const nextStep = useCallback(() => {
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
      return true;
    }
    return false;
  }, [step, steps.length]);

  const previousStep = useCallback(() => {
    if (step > 0) {
      setStep((prev) => prev - 1);
      return true;
    }
    return false;
  }, [step]);

  const resetSteps = useCallback(() => {
    setStep(0);
    setFormData({});
  }, []);

  return {
    step,
    steps,
    formData,
    updateField,
    nextStep,
    previousStep,
    resetSteps,
  };
}