import { IGenerativeAiService } from "../generative-ai-service";

export class MockGoogleGenerativeAiService implements IGenerativeAiService {
  private titles = [
    "Xbox 360",
    "PlayStation 5",
    "Nintendo Switch",
    "Café",
    "Almoço",
    "Uber",
    "Cinema",
    "Mercado",
    "Farmácia",
  ];

  private categories = [
    "Compras",
    "Alimentação",
    "Transporte",
    "Lazer",
    "Saúde",
  ];

  private getRandomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  private getRandomAmount(): number {
    return Number((Math.random() * 1000).toFixed(2));
  }

  private getRandomDateTime(): Date {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 30);
    return new Date(now.setDate(now.getDate() - randomDays));
  }

  public async generateContent() {
    return {
      text: JSON.stringify({
        title: this.getRandomItem(this.titles),
        amount: this.getRandomAmount(),
        category: this.getRandomItem(this.categories),
        dateTime: this.getRandomDateTime(),
      }),
    };
  }
}
