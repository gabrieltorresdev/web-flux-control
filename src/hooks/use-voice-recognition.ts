"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export function useVoiceRecognition(
  onTranscriptChange?: (transcript: string) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "pt-BR";

        recognition.onresult = (event) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          onTranscriptChange?.(transcript);
        };

        recognition.onerror = (event) => {
          switch (event.error) {
            case "not-allowed":
              setError(new Error("Permissão de microfone negada"));
              break;
            case "no-speech":
              setError(new Error("Nenhuma fala detectada"));
              break;
            case "network":
              setError(new Error("Erro de conexão"));
              break;
            default:
              setError(new Error(`Erro: ${event.error}`));
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
        setError(
          new Error("Reconhecimento de voz não suportado neste navegador")
        );
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onTranscriptChange]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError(new Error("Reconhecimento de voz não suportado"));
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);

        // Set timeout for long recordings
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
            setError(new Error("Tempo limite excedido. Tente novamente."));
          }
        }, 30000); // 30 seconds
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        }
        setIsListening(false);
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
