"use client";

import { useState, useCallback } from "react";

export function useVoiceInputState() {
  const [displayValue, setDisplayValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const updateValue = useCallback((value: string) => {
    setDisplayValue(value);
    setError(null);
  }, []);

  const setInputError = useCallback((message: string) => {
    setError(message);
  }, []);

  const reset = useCallback(() => {
    setDisplayValue("");
    setIsEditing(false);
    setError(null);
  }, []);

  return {
    displayValue,
    isEditing,
    error,
    startEditing,
    stopEditing,
    updateValue,
    setInputError,
    reset,
  };
}