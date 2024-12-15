"use client";

import React from "react";
import { Mic, MicOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceInputControlsProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onStartEditing: () => void;
}

export function VoiceInputControls({
  isListening,
  onStartListening,
  onStopListening,
  onStartEditing,
}: VoiceInputControlsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={isListening ? "destructive" : "default"}
        size="lg"
        className="w-24 h-24 rounded-full"
        onClick={isListening ? onStopListening : onStartListening}
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
        onClick={onStartEditing}
      >
        <Plus className="h-8 w-8" />
      </Button>
    </div>
  );
}