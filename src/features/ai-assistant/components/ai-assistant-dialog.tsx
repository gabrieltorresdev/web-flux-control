"use client";

import { ReactNode } from "react";
import { AiAssistantChat } from "./ai-assistant-chat";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/shared/components/ui/responsive-modal";

interface AiAssistantDialogProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AiAssistantDialog({
  children,
  open,
  onOpenChange,
}: AiAssistantDialogProps) {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>
      <ResponsiveModalContent className="max-w-[800px]">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Assistente de Transações</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Use comandos de voz ou texto para criar transações facilmente
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <AiAssistantChat />
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
} 