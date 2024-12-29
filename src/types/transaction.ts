import { Category } from "./category";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  dateTime: Date;
  category: Category;
}

export interface CreateTransactionInput {
  title: string;
  amount: number;
  dateTime: Date;
  categoryId: string;
}

export interface AiTransactionInput {
  title: string;
  amount: number;
  dateTime: Date;
  category: string;
}

export interface ApiTransactionResponse {
  data: Transaction;
}

export interface ApiTransactionListResponse {
  data: Transaction[];
}

export interface ApiTransactionSummaryResponse {
  data: {
    income: number;
    expense: number;
    total: number;
  };
}

export interface ApiTransactionPaginatedList {
  data: Transaction[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}
