export type Transaction = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  time: string;
  type: "income" | "expense";
  lastModified?: Date;
};

export type TransactionInput = Omit<Transaction, "id" | "lastModified">;

export const CATEGORIES = {
  food: "Alimentação",
  shopping: "Compras",
  work: "Trabalho",
  gift: "Presente",
  transport: "Transporte",
  home: "Casa",
} as const;
