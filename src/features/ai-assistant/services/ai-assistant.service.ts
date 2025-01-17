import { IAiAssistantStrategy } from "@/features/ai-assistant/types";
import { GoogleAiAssistantStrategy } from "./strategies/google-ai-assistant.strategy";
import { MockAiAssistantStrategy } from "./strategies/mock-ai-assistant.strategy";
import { CreateTransactionInput } from "@/features/transactions/types";

export class AiAssistantService {
  private strategy: IAiAssistantStrategy;

  constructor() {
    this.strategy = process.env.NODE_ENV === "development"
      ? new MockAiAssistantStrategy()
      : new GoogleAiAssistantStrategy();
  }

  public async processMessage(message: string): Promise<CreateTransactionInput> {
    return this.strategy.convertTranscriptToNewTransaction(message);
  }

  public getQuickActions() {
    return [
      {
        label: "Nova despesa",
        action: "new_expense",
        prompt: "Quero registrar uma nova despesa"
      },
      {
        label: "Nova receita", 
        action: "new_income",
        prompt: "Quero registrar uma nova receita"
      }
    ];
  }
} 