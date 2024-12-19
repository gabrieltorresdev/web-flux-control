import { MicOff, Mic } from "lucide-react";
import { Button } from "../ui/button";

interface VoiceRecordButtonProps {
  listening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  disabled: boolean;
}

export function VoiceRecordButton({
  listening,
  startListening,
  stopListening,
  disabled,
}: VoiceRecordButtonProps) {
  return (
    <Button
      variant={listening ? "destructive" : "default"}
      onClick={listening ? stopListening : startListening}
      className="w-full h-full"
      disabled={disabled}
    >
      {listening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
    </Button>
  );
}
