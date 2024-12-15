"use client";

import { useState, useCallback } from "react";
import { Category } from "@/types/category";
import { TransactionInput } from "@/types/transaction";
import { normalizeText } from "../utils/text-normalizer";
import { parseAmount } from "../utils/amount-parser";

export type Step = {
  title: string;
  question: string;
  field: string;
  validate: (value: string) => boolean;
};

export function useVoiceSteps(categories: Category[]) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<TransactionInput>>({});
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [spokenCategory, setSpokenCategory] = useState("");

  const steps: Step[] = [
    {
      title: "Título",
      question: "Qual o título da transação?",
      field: "title",
      validate: (value: string) => value.length >= 3,
    },
    {
      title: "Tipo",
      question: "É uma entrada ou saída?",
      field: "type",
      validate: (value: string) =>
        ["entrada", "saida", "saída"].includes(value.toLowerCase()),
    },
    {
      title: "Categoria",
      question: "Qual a categoria da transação?",
      field: "category",
      validate: (value: string) =>
        categories.some((c) => normalizeText(c.name) === normalizeText(value)),
    },
    {
      title: "Valor",
      question: "Qual o valor da transação?",
      field: "amount",
      validate: (value: string) => parseAmount(value) !== null,
    },
  ];

  const processVoiceInput = useCallback(
    (transcript: string, currentStep: number) => {
      setProcessingError(null);
      const normalizedInput = transcript.toLowerCase().trim();

      try {
        switch (currentStep) {
          case 0: // Title
            if (normalizedInput.length < 3) {
              setProcessingError("O título deve ter pelo menos 3 caracteres");
              return false;
            }
            setFormData((prev) => ({ ...prev, title: transcript }));
            return true;

          case 1: // Type
            const type = normalizedInput.includes("entrada")
              ? "income"
              : "expense";
            setFormData((prev) => ({ ...prev, type }));
            return true;

          case 2: // Category
            setSpokenCategory(normalizedInput);
            const category = categories.find(
              (c) => normalizeText(c.name) === normalizeText(normalizedInput)
            );
            if (category) {
              setFormData((prev) => ({ ...prev, categoryId: category.id }));
              return true;
            }
            return false;

          case 3: // Amount
            const amount = parseAmount(normalizedInput);
            if (amount === null) {
              setProcessingError("Valor inválido. Por favor, tente novamente.");
              return false;
            }
            setFormData((prev) => ({ ...prev, amount }));
            return true;

          default:
            return false;
        }
      } catch (error) {
        console.error("Error processing voice input:", error);
        setProcessingError("Erro ao processar entrada de voz");
        return false;
      }
    },
    [categories]
  );

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
    setSpokenCategory("");
    setProcessingError(null);
  }, []);

  return {
    step,
    steps,
    formData,
    spokenCategory,
    processingError,
    processVoiceInput,
    nextStep,
    previousStep,
    resetSteps,
  };
}
