"use server";

import { TransactionService } from "@/services/transaction-service";
import { CreateTransactionInput } from "@/types/transaction";
import { startOfMonth, endOfMonth } from "date-fns";
import { revalidatePath } from "next/cache";
import {
  handleServerActionError,
  ServerActionResult,
} from "@/lib/api/error-handler";

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

export async function createTransaction(
  input: CreateTransactionInput
): Promise<ServerActionResult<void>> {
  try {
    await transactionService.create(input);
    revalidatePath("/transactions");
    return { data: undefined };
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function updateTransaction(
  id: string,
  input: CreateTransactionInput
): Promise<ServerActionResult<void>> {
  try {
    await transactionService.update(id, input);
    revalidatePath("/transactions");
    return { data: undefined };
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function deleteTransaction(
  id: string
): Promise<ServerActionResult<void>> {
  try {
    await transactionService.delete(id);
    revalidatePath("/transactions");
    return { data: undefined };
  } catch (error) {
    return handleServerActionError(error);
  }
}
