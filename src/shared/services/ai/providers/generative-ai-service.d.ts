type GenerateContentResponse = {
  text: string;
};

export interface IGenerativeAiService {
  generateContent(prompt: string): Promise<GenerateContentResponse>;
}
