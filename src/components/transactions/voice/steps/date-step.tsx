"use client";

import React from "react";
import { VoiceInputField } from "../input/voice-input-field";
import { parseSpokenDate } from "@/lib/utils/date-parser";
import type { StepProps } from "./types";

export function DateStep({ onNext, onCancel, onBack }: StepProps) {
  const handleConfirm = (value: string) => {
    const { date, time, error } = parseSpokenDate(value);
    if (date && time) {
      onNext({
        date: date.toISOString().split('T')[0],
        time
      });
    }
  };

  return (
    <VoiceInputField
      onConfirm={handleConfirm}
      placeholder="Digite ou fale a data e hora da transação..."
      validator={(value) => {
        const { date, time, error } = parseSpokenDate(value);
        if (!date || !time) {
          return error || "Por favor, informe a data e o horário da transação";
        }
        return null;
      }}
      onCancel={onCancel}
      onBack={onBack}
    />
  );
}