import { GoogleGenerativeAI } from "@google/generative-ai";
import { IGenerativeAiService } from "./generative-ai-service";

type GoogleAiModel = "gemini-1.5-flash" | "gemini-2.0-flash-exp";

export class GoogleGenerativeAiService implements IGenerativeAiService {
  protected aiKey: string;
  protected model: GoogleAiModel;

  constructor(model?: GoogleAiModel) {
    this.aiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";

    if (!this.aiKey.length)
      throw new Error("Falha ao carregar a apiKey no env");

    this.model = model ?? "gemini-1.5-flash";
  }

  public async generateContent(prompt: string) {
    const genAI = new GoogleGenerativeAI(this.aiKey);

    const model = genAI.getGenerativeModel({ model: this.model });

    const { response } = await model.generateContent(prompt);

    return {
      text: response.text(),
    };
  }
}
