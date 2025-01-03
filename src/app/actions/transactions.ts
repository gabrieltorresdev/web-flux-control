"use server";

import { TransactionService } from "@/services/transaction-service";
import { CreateTransactionInput } from "@/types/transaction";
import { startOfMonth, endOfMonth } from "date-fns";
import { revalidatePath } from "next/cache";

const transactionService = new TransactionService();

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

  return transactionService.getSummary(startDate, endDate, categoryId, search);
}

export async function createTransaction(input: CreateTransactionInput) {
  try {
    const response = await transactionService.create(input);
    revalidatePath("/transactions");
    return response;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

export async function updateTransaction(
  id: string,
  input: CreateTransactionInput
) {
  try {
    const response = await transactionService.update(id, input);
    revalidatePath("/transactions");
    return response;
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
}

export async function deleteTransaction(id: string) {
  try {
    await transactionService.delete(id);
    revalidatePath("/transactions");
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
}
