import { AiTransactionInput } from "@/features/transactions/types";
import { IGenerativeAiService } from "@/shared/services/ai/providers/generative-ai-service";

export class AiTransactionService {
  constructor(private generativeAiService: IGenerativeAiService) {}

  public async convertTranscriptToNewTransaction(
    newTransactionTranscript: string
  ): Promise<AiTransactionInput> {
    const now = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const prompt = `
      Date reference: ${now.toISOString()}
      Timezone: ${timezone}
      Text: ${newTransactionTranscript}

      Extract:

      title: Capitalize the first letter of each word.
      amount: Extract and format as a number.
      category: Capitalize the first letter of each word.
      dateTime: Calculate based on the date reference, text context, and timezone.
      Return in:

      Minified JSON.
      Plain text (no explanation).
    `;

    const { text } = await this.generativeAiService.generateContent(prompt);
    const result = JSON.parse(this.unquoteAiJsonString(text));

    return {
      ...result,
      dateTime: new Date(result.dateTime),
    };
  }

  protected unquoteAiJsonString(text: string): string {
    const unquotedJson = text.match(/```json\n([\s\S]*?)\n```/)?.[1];

    if (!unquotedJson) {
      return text;
    }

    return unquotedJson;
  }
}
