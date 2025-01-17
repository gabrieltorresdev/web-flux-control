import { AiTransactionService } from "@/shared/services/ai/ai-transaction-service";
import { MockGoogleGenerativeAiService } from "@/shared/services/ai/providers/mocks/mock-google-generative-ai-service";
import { IAiAssistantStrategy } from "@/features/ai-assistant/types";
import { CreateTransactionInput } from "@/features/transactions/types";

export class MockAiAssistantStrategy implements IAiAssistantStrategy {
  private aiService: AiTransactionService;
  
  constructor() {
    this.aiService = new AiTransactionService(new MockGoogleGenerativeAiService());
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