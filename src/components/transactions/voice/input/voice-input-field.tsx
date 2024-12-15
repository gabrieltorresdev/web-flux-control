"use client";

import React, { useCallback } from "react";
import { Mic, MicOff, Loader2, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVoiceInput } from "@/hooks/use-voice-input";

type VoiceInputFieldProps = {
  onConfirm: (value: string) => void;
  placeholder?: string;
  validator?: (value: string) => string | null;
  onCancel: () => void;
  onBack?: () => void;
};

export function VoiceInputField({ 
  onConfirm, 
  placeholder,
  validator,
  onCancel,
  onBack
}: VoiceInputFieldProps) {
  const {
    displayValue,
    isEditing,
    isListening,
    error,
    startListening,
    stopListening,
    startEditing,
    stopEditing,
    onEditChange,
    reset,
  } = useVoiceInput();

  const handleSave = useCallback(() => {
    if (displayValue) {
      if (validator) {
        const error = validator(displayValue);
        if (error) {
          return;
        }
      }
      onConfirm(displayValue);
      reset();
    }
  }, [displayValue, onConfirm, validator, reset]);

  const handleCancel = useCallback(() => {
    reset();
    onCancel();
  }, [reset, onCancel]);

  const validationError = displayValue && validator ? validator(displayValue) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="w-24 h-24 rounded-full"
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-24 h-24 rounded-full"
            onClick={startEditing}
          >
            <Plus className="h-8 w-8" />
          </Button>
        </div>

        {isListening && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Ouvindo...
          </div>
        )}

        {isEditing ? (
          <div className="flex items-center gap-2 w-full max-w-sm">
            <Input
              value={displayValue || ""}
              onChange={(e) => onEditChange(e.target.value)}
              className="flex-1"
              placeholder={placeholder}
              autoFocus
            />
          </div>
        ) : displayValue && (
          <p className="text-center text-lg">{displayValue}</p>
        )}

        {(error || validationError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error?.message || validationError}</AlertDescription>
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
        <Button 
          onClick={handleSave}
          disabled={!displayValue || Boolean(validationError)}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}