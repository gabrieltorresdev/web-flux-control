import { CreateTransactionInput } from "@/features/transactions/types";

export interface IAiAssistantStrategy {
  convertTranscriptToNewTransaction(transcript: string): Promise<CreateTransactionInput>;
}

export interface QuickAction {
  label: string;
  action: string;
  prompt: string;
}

export interface AiAssistantMessage {
  id: string;
  content: string;
  type: "user" | "assistant";
  timestamp: Date;
  data?: {
    transaction?: CreateTransactionInput;
    suggestedCategory?: {
      name: string;
      type: "income" | "expense";
    };
    error?: string;
  };
}

export interface AiAssistantState {
  messages: AiAssistantMessage[];
  isProcessing: boolean;
  error?: string;
} 