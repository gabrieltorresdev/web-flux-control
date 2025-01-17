import { useState, useCallback } from "react";
import { AiAssistantService } from "../services/ai-assistant.service";
import { AiAssistantMessage, AiAssistantState } from "../types";
import { v4 as uuidv4 } from "uuid";
import { processAiTransaction } from "@/features/transactions/actions/transactions";
import { CreateTransactionInput } from "@/features/transactions/types";

export function useAiAssistant() {
  const [state, setState] = useState<AiAssistantState>({
    messages: [],
    isProcessing: false
  });

  const aiService = new AiAssistantService();

  const addMessage = useCallback((content: string, type: "user" | "assistant", data?: AiAssistantMessage["data"]) => {
    const message: AiAssistantMessage = {
      id: uuidv4(),
      content,
      type,
      timestamp: new Date(),
      data
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));

    return message;
  }, []);

  const processMessage = useCallback(async (message: string) => {
    setState(prev => ({ ...prev, isProcessing: true, error: undefined }));
    
    try {
      // Adiciona mensagem do usuário
      addMessage(message, "user");

      // Processa com a IA
      const result = await processAiTransaction(message);

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (!result.data) {
        throw new Error("Não foi possível processar a transação");
      }

      // Se for uma solicitação de detalhes
      if ('type' in result.data && result.data.type === "request_details") {
        addMessage(result.data.message, "assistant");
        return;
      }

      // Se for uma transação processada
      const transaction = result.data as CreateTransactionInput & { suggestedCategory?: { name: string; type: "income" | "expense" } };
      
      addMessage(
        "Entendi! Aqui está o que eu extraí da sua mensagem:",
        "assistant",
        { 
          transaction: {
            title: transaction.title,
            amount: transaction.amount,
            dateTime: transaction.dateTime,
            categoryId: transaction.categoryId
          },
          suggestedCategory: transaction.suggestedCategory
        }
      );

      return transaction;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar mensagem";
      setState(prev => ({ ...prev, error: errorMessage }));
      
      // Adiciona mensagem de erro
      addMessage(
        "Desculpe, não consegui processar sua solicitação. Por favor, tente novamente.",
        "assistant",
        { error: errorMessage }
      );
      
      throw error;
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [addMessage]);

  const getQuickActions = useCallback(() => {
    return aiService.getQuickActions();
  }, [aiService]);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [], error: undefined }));
  }, []);

  return {
    messages: state.messages,
    isProcessing: state.isProcessing,
    error: state.error,
    processMessage,
    getQuickActions,
    clearMessages
  };
} 