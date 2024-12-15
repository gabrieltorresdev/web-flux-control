"use client";

import { useCallback } from "react";
import { useStore } from "@/store";
import { useVoiceRecognition } from "./use-voice-recognition";

export function useVoiceInput() {
  const {
    transcript: storeTranscript,
    editedValue,
    isEditing,
    setTranscript,
    setEditedValue,
    startEditing,
    stopEditing,
    reset: resetStore,
  } = useStore();

  const {
    isListening,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript: resetVoice,
    isSupported,
  } = useVoiceRecognition((transcript) => {
    setTranscript(transcript);
  });

  const handleStartEditing = useCallback(() => {
    startEditing();
  }, [startEditing]);

  const handleStopEditing = useCallback(() => {
    stopEditing();
  }, [stopEditing]);

  const handleEditChange = useCallback((value: string) => {
    setEditedValue(value);
  }, [setEditedValue]);

  const reset = useCallback(() => {
    resetStore();
    resetVoice();
  }, [resetStore, resetVoice]);

  return {
    transcript: storeTranscript,
    editedValue,
    isEditing,
    isListening,
    isSupported,
    error: voiceError,
    displayValue: isEditing ? editedValue : storeTranscript,
    startListening,
    stopListening,
    startEditing: handleStartEditing,
    stopEditing: handleStopEditing,
    onEditChange: handleEditChange,
    reset,
  };
}