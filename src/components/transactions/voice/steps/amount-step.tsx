"use client";

import React from "react";
import { VoiceInputField } from "../input/voice-input-field";
import { parseAmount } from "../utils/amount-parser";
import type { StepProps } from "./types";

export function AmountStep({ onNext }: StepProps) {
  const handleConfirm = (value: string) => {
    const amount = parseAmount(value);
    if (amount !== null) {
      onNext({ amount });
    }
  };

  return (
    <VoiceInputField
      onConfirm={handleConfirm}
      placeholder="Digite ou fale o valor da transação..."
      validator={(value) => {
        const amount = parseAmount(value);
        if (amount === null) {
          return "Valor inválido. Por favor, tente novamente.";
        }
        return null;
      }}
    />
  );
}