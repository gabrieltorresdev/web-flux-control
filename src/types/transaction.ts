import { Category } from "./category";

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
  time: string;
};

export interface TransactionInput extends Omit<Transaction, "id" | "category"> {
  categoryId: string;
}

export type TransactionFilters = {
  page?: string;
  perPage?: string;
  search?: string;
  categoryId?: string;
  type?: "income" | "expense";
  startDate?: string;
  endDate?: string;
};

export type TransactionSummary = {
  income: number;
  expense: number;
  total: number;
};