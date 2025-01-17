import { IGenerativeAiService } from "@/shared/services/ai/providers/generative-ai-service";
import { AiAssistantResponse } from "@/features/transactions/types";

export class MockGoogleGenerativeAiService implements IGenerativeAiService {
  private expenseTitles = [
    "Café",
    "Almoço",
    "Uber",
    "Cinema",
    "Mercado",
    "Farmácia",
  ];

  private incomeTitles = [
    "Salário",
    "Freelance",
    "Investimentos",
    "Venda",
    "Aluguel",
    "Consultoria",
  ];

  private expenseCategories = [
    "Alimentação e Bebidas",
    "Transporte e Mobilidade",
    "Lazer e Entretenimento",
    "Saúde e Bem-estar",
    "Compras e Shopping",
  ];

  private incomeCategories = [
    "Salário e Renda Fixa",
    "Investimentos e Dividendos",
    "Vendas e Comissões",
    "Serviços e Freelance",
    "Outros Rendimentos",
  ];

  private getRandomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  private getRandomAmount(isIncome: boolean): number {
    // Incomes tend to be higher than expenses in the mock
    const multiplier = isIncome ? 5000 : 1000;
    return Number((Math.random() * multiplier).toFixed(2));
  }

  private getRandomDateTime(): Date {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
    return new Date(currentYear, currentMonth, randomDay);
  }

  public async generateContent(prompt?: string) {
    const isIncome = prompt?.toLowerCase().includes("receita") ?? false;
    const isInitialPrompt = prompt?.toLowerCase().includes("quero registrar");

    // Se for o prompt inicial, retorna uma mensagem pedindo os detalhes
    if (isInitialPrompt) {
      const response: AiAssistantResponse = {
        type: "request_details",
        message: isIncome 
          ? "Por favor, me diga os detalhes da sua receita (título, valor e data)."
          : "Por favor, me diga os detalhes da sua despesa (título, valor e data)."
      };

      return {
        text: JSON.stringify(response)
      };
    }

    const response: AiAssistantResponse = {
      type: "transaction",
      transaction: {
        title: this.getRandomItem(isIncome ? this.incomeTitles : this.expenseTitles),
        amount: this.getRandomAmount(isIncome),
        category: this.getRandomItem(isIncome ? this.incomeCategories : this.expenseCategories),
        dateTime: this.getRandomDateTime(),
      }
    };

    return {
      text: JSON.stringify(response)
    };
  }
}
