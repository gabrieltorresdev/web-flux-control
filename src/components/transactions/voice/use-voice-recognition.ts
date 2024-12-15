"use client";

import { useState, useCallback, useEffect } from "react";

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "pt-BR";
        
        // Add timeout for long recordings
        const timeout = 30000; // 30 seconds
        let timeoutId: NodeJS.Timeout;

        recognition.onstart = () => {
          timeoutId = setTimeout(() => {
            recognition.stop();
            setError(new Error("Tempo limite excedido. Tente novamente."));
          }, timeout);
        };

        recognition.onresult = (event) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setTranscript(transcript);
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
          clearTimeout(timeoutId);
          setIsListening(false);
        };

        setRecognition(recognition);
      } else {
        setIsSupported(false);
        setError(new Error("Reconhecimento de voz não suportado neste navegador"));
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError(new Error("Reconhecimento de voz não suportado"));
      return;
    }

    if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        }
        setIsListening(false);
      }
    }
  }, [recognition, isSupported]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isSupported,
  };
}