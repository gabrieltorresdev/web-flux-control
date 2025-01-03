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
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
    return new Date(currentYear, currentMonth, randomDay);
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
