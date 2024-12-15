"use client";

import React, { useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { useVoiceInputState } from "./use-voice-input-state";
import { VoiceInputControls } from "./voice-input-controls";

export interface VoiceInputFieldProps {
  onConfirm: (value: string) => void;
  onCancel: () => void;
  onBack?: () => void;
  placeholder?: string;
  validator?: (value: string) => string | null;
}

export function VoiceInputField({
  onConfirm,
  onCancel,
  onBack,
  placeholder,
  validator,
}: VoiceInputFieldProps) {
  const {
    displayValue,
    isEditing,
    error: inputError,
    startEditing,
    stopEditing,
    updateValue,
    setInputError,
    reset,
  } = useVoiceInputState();

  const {
    isListening,
    error: voiceError,
    startListening,
    stopListening,
    isSupported,
  } = useVoiceRecognition((transcript) => {
    updateValue(transcript);
  });

  const handleSave = useCallback(() => {
    if (!displayValue) return;

    if (validator) {
      const validationError = validator(displayValue);
      if (validationError) {
        setInputError(validationError);
        return;
      }
    }

    onConfirm(displayValue);
    reset();
  }, [displayValue, validator, onConfirm, setInputError, reset]);

  const handleCancel = useCallback(() => {
    reset();
    onCancel();
  }, [reset, onCancel]);

  if (!isSupported) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Seu navegador não suporta reconhecimento de voz.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <VoiceInputControls
          isListening={isListening}
          onStartListening={startListening}
          onStopListening={stopListening}
          onStartEditing={startEditing}
        />

        {isListening && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Ouvindo...
          </div>
        )}

        {isEditing ? (
          <div className="flex items-center gap-2 w-full max-w-sm">
            <Input
              value={displayValue}
              onChange={(e) => updateValue(e.target.value)}
              className="flex-1"
              placeholder={placeholder}
              autoFocus
            />
          </div>
        ) : displayValue && (
          <p className="text-center text-lg">{displayValue}</p>
        )}

        {(voiceError || inputError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {voiceError?.message || inputError}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
        )}
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={!displayValue}>
          Próximo
        </Button>
      </div>
    </div>
  );
}