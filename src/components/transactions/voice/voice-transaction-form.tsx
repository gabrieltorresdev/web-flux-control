"use client";

import { useEffect } from "react";
import { parseAmount } from "./voice-transaction-parser";
import { type TransactionFormData } from "@/lib/validations/transaction";

type VoiceTransactionFormProps = {
  transcript: string;
  currentStep: number;
  formData: Partial<TransactionFormData>;
  onUpdateFormData: (data: Partial<TransactionFormData>) => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onClose: () => void;
};

export function VoiceTransactionForm({
  transcript,
  currentStep,
  formData,
  onUpdateFormData,
  onSubmit,
  onClose,
}: VoiceTransactionFormProps) {
  useEffect(() => {
    if (!transcript) return;

    switch (currentStep) {
      case 0: // Title
        onUpdateFormData({ ...formData, title: transcript });
        break;

      case 1: // Type
        const type = transcript.toLowerCase().includes("entrada")
          ? "income"
          : "expense";
        onUpdateFormData({ ...formData, type });
        break;

      case 2: // Category
        const normalizedTranscript = transcript.toLowerCase();

        onUpdateFormData({
          ...formData,
          category: normalizedTranscript,
        });
        break;

      case 3: // Amount
        const amount = parseAmount(transcript);
        if (amount !== null) {
          onUpdateFormData({ ...formData, amount });
        }
        break;
    }
  }, [transcript, currentStep, formData, onUpdateFormData]);

  useEffect(() => {
    const isFormComplete = (
      data: Partial<TransactionFormData>
    ): data is TransactionFormData => {
      return !!(
        data.title &&
        data.category &&
        typeof data.amount === "number" &&
        data.date &&
        data.time
      );
    };

    if (currentStep === 3 && isFormComplete(formData)) {
      onSubmit(formData).then(onClose);
    }
  }, [currentStep, formData, onSubmit, onClose]);

  return null;
}
