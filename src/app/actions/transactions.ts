"use server";

import { TransactionService } from "@/services/transaction-service";
import { startOfMonth, endOfMonth } from "date-fns";

export type TransactionListParams = {
  month?: number;
  year?: number;
  categoryId?: string;
  search?: string;
  page?: number;
  perPage?: number;
};

export async function getTransactionsList({
  month,
  year,
  categoryId,
  search,
  page = 1,
  perPage = 10,
}: TransactionListParams = {}) {
  const date = new Date(
    year || new Date().getFullYear(),
    month !== undefined ? month - 1 : new Date().getMonth()
  );
  const startDate = startOfMonth(date);
  const endDate = endOfMonth(date);

  const transactionService = new TransactionService();
  const transactions = await transactionService.findAllPaginated(
    startDate,
    endDate,
    categoryId,
    search,
    { page, perPage }
  );

  return {
    transactions,
    nextPage:
      transactions.meta.current_page < transactions.meta.last_page
        ? transactions.meta.current_page + 1
        : undefined,
  };
}

export async function getTransactionsSummary({
  month,
  year,
  categoryId,
  search,
}: Omit<TransactionListParams, "page" | "perPage"> = {}) {
  const date = new Date(
    year || new Date().getFullYear(),
    month !== undefined ? month - 1 : new Date().getMonth()
  );
  const startDate = startOfMonth(date);
  const endDate = endOfMonth(date);

  const transactionService = new TransactionService();
  return transactionService.getSummary(startDate, endDate, categoryId, search);
}
