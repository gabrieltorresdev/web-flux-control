import { AiTransactionService } from "@/shared/services/ai/ai-transaction-service";
import { GoogleGenerativeAiService } from "@/shared/services/ai/providers/google-generative-ai-service";
import { IAiAssistantStrategy } from "@/features/ai-assistant/types";
import { CreateTransactionInput } from "@/features/transactions/types";

export class GoogleAiAssistantStrategy implements IAiAssistantStrategy {
  private aiService: AiTransactionService;
  
  constructor() {
    this.aiService = new AiTransactionService(new GoogleGenerativeAiService());
  }
  
  async convertTranscriptToNewTransaction(transcript: string): Promise<CreateTransactionInput> {
    const result = await this.aiService.convertTranscriptToNewTransaction(transcript);
    return {
      title: result.title,
      amount: result.amount,
      dateTime: result.dateTime,
      categoryId: ""
    };
  }
} 