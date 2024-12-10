import { Transaction, CATEGORIES } from "../types/transaction";

const descriptions = [
  "Almoço",
  "Café",
  "Supermercado",
  "Uber",
  "Salário",
  "Freelance",
  "Cinema",
  "Netflix",
  "Internet",
  "Luz",
  "Água",
  "Aluguel",
  "Academia",
  "Roupas",
  "Presente",
];

function randomDate(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function padZero(num: number): string {
  return num.toString().padStart(2, "0");
}

export function generateMockTransactions(count: number = 50): Transaction[] {
  const transactions: Transaction[] = [];
  const categories = Object.keys(CATEGORIES);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const date = randomDate(thirtyDaysAgo, now);
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);

    transactions.push({
      id: crypto.randomUUID(),
      description:
        descriptions[Math.floor(Math.random() * descriptions.length)],
      amount: Math.floor(Math.random() * 1000) + 10,
      category: categories[Math.floor(Math.random() * categories.length)],
      type: Math.random() > 0.5 ? "income" : "expense",
      date: date.toISOString().split("T")[0],
      time: `${padZero(hours)}:${padZero(minutes)}`,
    });
  }

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
