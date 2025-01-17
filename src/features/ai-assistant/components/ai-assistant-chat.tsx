"use client";

import { useEffect, useRef } from "react";
import { AiAssistantMessage } from "./ai-assistant-message";
import { AiAssistantQuickActions } from "./ai-assistant-quick-actions";
import { useAiAssistant } from "../hooks/use-ai-assistant";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { SendHorizonal, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/shared/utils";

const messageSchema = z.object({
  content: z.string().min(1, "Digite uma mensagem")
});

type MessageFormData = z.infer<typeof messageSchema>;

interface AiAssistantChatProps {
  className?: string;
}

export function AiAssistantChat({ className }: AiAssistantChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isProcessing,
    error,
    processMessage,
    getQuickActions,
    clearMessages
  } = useAiAssistant();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema)
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await processMessage(data.content);
      reset();
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  const handleQuickAction = async (action: { prompt: string }) => {
    try {
      await processMessage(action.prompt);
    } catch (error) {
      console.error("Error processing quick action:", error);
    }
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <h3 className="text-lg font-semibold">
              Assistente de Transações
            </h3>
            <p className="text-sm text-muted-foreground max-w-[500px]">
              Olá! Eu sou seu assistente para criar transações. Você pode me dizer
              naturalmente o que quer registrar, como "Gastei 50 reais com almoço
              hoje" ou usar os botões abaixo para começar.
            </p>
            <div className="mt-4">
              <AiAssistantQuickActions
                actions={getQuickActions()}
                onActionClick={handleQuickAction}
                disabled={isProcessing}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col divide-y">
            {messages.map((message) => (
              <AiAssistantMessage key={message.id} message={message} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-background p-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Textarea
              {...register("content")}
              placeholder="Digite sua mensagem..."
              className="min-h-[80px] resize-none"
              disabled={isProcessing}
            />
            {errors.content && (
              <p className="text-sm text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <AiAssistantQuickActions
                actions={getQuickActions()}
                onActionClick={handleQuickAction}
                disabled={isProcessing}
              />
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearMessages}
                  disabled={isProcessing}
                >
                  Limpar
                </Button>
              )}

              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <SendHorizonal className="mr-2 h-4 w-4" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 