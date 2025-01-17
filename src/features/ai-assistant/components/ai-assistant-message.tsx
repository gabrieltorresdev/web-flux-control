"use client";

import { AiAssistantMessage as AiMessage } from "../types";
import { cn } from "@/shared/utils";
import { Bot, User, AlertTriangle, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/shared/components/ui/button";
import { useState } from "react";
import { CreateCategoryDialog } from "@/features/categories/components/create-category-dialog";

interface AiAssistantMessageProps {
  message: AiMessage;
}

export function AiAssistantMessage({ message }: AiAssistantMessageProps) {
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const isBot = message.type === "assistant";
  const hasTransaction = message.data?.transaction;
  const hasSuggestedCategory = message.data?.suggestedCategory;
  const hasError = message.data?.error;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div
      className={cn(
        "flex w-full gap-2 py-4",
        isBot ? "bg-muted/50" : "bg-background"
      )}
    >
      <div className="flex w-full max-w-screen-md mx-auto gap-4 px-4">
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
          {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </div>

        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="space-y-4">
            <p className="leading-normal">
              {message.content}
            </p>

            {hasTransaction && message.data?.transaction && (
              <div className="rounded-lg border bg-card p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Título</div>
                    <div>{message.data.transaction.title}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Valor</div>
                    <div>{formatCurrency(message.data.transaction.amount)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Data</div>
                    <div>
                      {format(
                        new Date(message.data.transaction.dateTime),
                        "PPP",
                        { locale: ptBR }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasSuggestedCategory && message.data?.suggestedCategory && (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-yellow-500/20 p-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-yellow-500">
                      Categoria não encontrada
                    </p>
                    <p className="text-sm text-muted-foreground">
                      A categoria <strong>{message.data.suggestedCategory.name}</strong> não existe. 
                      Deseja criar uma nova categoria?
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateCategory(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Criar categoria
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {hasError && message.data?.error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                {message.data.error}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <time
              dateTime={message.timestamp.toISOString()}
              className="text-xs text-muted-foreground"
            >
              {format(message.timestamp, "HH:mm")}
            </time>
          </div>
        </div>
      </div>

      {showCreateCategory && message.data?.suggestedCategory && (
        <CreateCategoryDialog
          open={showCreateCategory}
          onOpenChange={setShowCreateCategory}
          defaultCategoryName={message.data.suggestedCategory.name}
          defaultCategoryType={message.data.suggestedCategory.type}
        />
      )}
    </div>
  );
} 