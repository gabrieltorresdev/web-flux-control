import "regenerator-runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useEffect, useState } from "react";

const language = "pt-BR";

export function useVoiceRecognition() {
  const [speechRecognitionSupported, setSpeechRecognitionSupported] =
    useState(false);
  const [manualTranscript, setManualTranscript] = useState<string>("");
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    finalTranscript,
    isMicrophoneAvailable,
    interimTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    setSpeechRecognitionSupported(browserSupportsSpeechRecognition);
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    setManualTranscript(transcript);
  }, [transcript]);

  async function startListening(): Promise<void> {
    await SpeechRecognition.startListening({ language });
  }

  async function stopListening(): Promise<void> {
    await SpeechRecognition.stopListening();
  }

  return {
    transcript: manualTranscript,
    setTranscript: setManualTranscript,
    listening,
    resetTranscript,
    speechRecognitionSupported,
    finalTranscript,
    isMicrophoneAvailable,
    interimTranscript,
    startListening,
    stopListening,
  };
}
