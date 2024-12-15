"use client";

import React, { useState } from "react";
import { Mic, MicOff, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVoiceRecognition } from "../use-voice-recognition";
import { CategoryInput } from "@/types/category";
import { useToast } from "@/hooks/use-toast";

type VoiceCategoryFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryInput) => Promise<void>;
};

type Step = {
  title: string;
  question: string;
  field: keyof CategoryInput;
  validate: (value: string) => boolean;
};

export function VoiceCategoryForm({
  isOpen,
  onClose,
  onSubmit,
}: VoiceCategoryFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<CategoryInput>>({});
  const [processingError, setProcessingError] = useState<string | null>(null);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error: voiceError,
    isSupported,
  } = useVoiceRecognition();

  const steps: Step[] = [
    {
      title: "Nome",
      question: "Qual o nome da categoria?",
      field: "name",
      validate: (value: string) => value.length >= 3,
    },
    {
      title: "Tipo",
      question: "É uma categoria de entrada ou saída?",
      field: "type",
      validate: (value: string) =>
        ["entrada", "saida", "saída"].includes(value.toLowerCase()),
    },
  ];

  const processVoiceInput = (transcript: string, currentStep: number) => {
    setProcessingError(null);
    const normalizedInput = transcript.toLowerCase().trim();

    try {
      switch (currentStep) {
        case 0: // Name
          if (normalizedInput.length < 3) {
            setProcessingError("O nome deve ter pelo menos 3 caracteres");
            return false;
          }
          setFormData((prev) => ({ ...prev, name: transcript }));
          return true;

        case 1: // Type
          const type = normalizedInput.includes("entrada")
            ? "income"
            : "expense";
          setFormData((prev) => ({ ...prev, type }));
          return true;

        default:
          return false;
      }
    } catch (error) {
      console.error("Error processing voice input:", error);
      setProcessingError("Erro ao processar entrada de voz");
      return false;
    }
  };

  const handleVoiceResult = () => {
    if (!transcript) return;

    const success = processVoiceInput(transcript, step);
    if (success) {
      if (step < steps.length - 1) {
        setStep((prev) => prev + 1);
      } else {
        handleSubmit();
      }
      resetTranscript();
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.type) {
        throw new Error("Dados incompletos");
      }

      await onSubmit(formData as CategoryInput);
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      });
      handleClose();
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setStep(0);
    setFormData({});
    resetTranscript();
    onClose();
  };

  if (!isSupported) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seu navegador não suporta reconhecimento de voz. Por favor, use um
              navegador mais recente.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Categoria por Voz</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <p className="text-lg font-medium">{steps[step].question}</p>

            <div className="flex flex-col items-center gap-4">
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

              {isListening && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ouvindo...
                </div>
              )}

              {transcript && (
                <p className="text-center text-lg">{transcript}</p>
              )}

              {(voiceError || processingError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {voiceError?.message || processingError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (step > 0) {
                  setStep((prev) => prev - 1);
                  resetTranscript();
                } else {
                  handleClose();
                }
              }}
            >
              {step === 0 ? "Cancelar" : "Voltar"}
            </Button>

            <Button
              onClick={handleVoiceResult}
              disabled={!transcript || isListening}
            >
              {step === steps.length - 1 ? "Finalizar" : "Próximo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
