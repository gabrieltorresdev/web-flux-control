"use client";

import { useState } from "react";
import { AiAssistantDialog } from "./ai-assistant-dialog";
import { AiAssistantChat } from "./ai-assistant-chat";
import { Button } from "@/shared/components/ui/button";
import { Bot, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingAiAssistantProps {
  className?: string;
}

export function FloatingAiAssistant({ className }: FloatingAiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sidebar on desktop */}
      <div className="hidden md:block">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          <div className="h-full px-4 py-4 overflow-y-auto">
            <AiAssistantChat />
          </div>
        </motion.div>
      </div>

      {/* Modal on mobile */}
      <div className="md:hidden">
        <Button
          size="sm"
          variant="ghost"
          className="h-9 w-9 rounded-full"
          onClick={() => setIsOpen(true)}
        >
          <Bot className="h-5 w-5" />
        </Button>

        <AiAssistantDialog
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <span />
        </AiAssistantDialog>
      </div>
    </>
  );
}