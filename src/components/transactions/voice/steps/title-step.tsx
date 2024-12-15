"use client";

import React from "react";
import { VoiceInputField } from "../input/voice-input-field";
import type { StepProps } from "./types";

export function TitleStep({ onNext }: StepProps) {
  const handleConfirm = (value: string) => {
    onNext({ title: value });
  };

  return (
    <VoiceInputField
      onConfirm={handleConfirm}
      placeholder="Digite ou fale o título da transação..."
    />
  );
}