import { Category } from "@/features/categories/types";

export interface TransactionFilters {
  /** Selected category ID */
  categoryId?: string;
  /** Selected month (1-12) */
  month?: string;
  /** Selected year */
  year?: string;
  /** Search term */
  search?: string;
}

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
    perPage: number;
    to: number;
    total: number;
  };
}

export interface PaginationParams {
  page: number;
  perPage: number;
}
