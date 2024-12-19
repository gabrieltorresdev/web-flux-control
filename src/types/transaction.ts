import { Category } from "./category";
import { ApiPaginatedResponse } from "./service";

export interface Transaction {
  id: string;
  category: Category;
  title: string;
  dateTime: Date;
  amount: number;
}

export interface AiTransactionInput
  extends Omit<Transaction, "id" | "category"> {
  category: string;
}

export type ApiTransactionPaginatedList = ApiPaginatedResponse<Transaction[]>;

export interface CreateTransactionInput
  extends Omit<Transaction, "id" | "category"> {
  categoryId: string;
}

export interface TransactionSummary {
  income: number;
  expense: number;
  total: number;
}

export interface ApiTransactionSummaryResponse {
  data: TransactionSummary;
}
