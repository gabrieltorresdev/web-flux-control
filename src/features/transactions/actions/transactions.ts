"use server";

import { TransactionService } from "@/features/transactions/services/transaction-service";
import { CreateTransactionInput } from "@/features/transactions/types";
import { startOfMonth, endOfMonth } from "date-fns";
import { revalidatePath } from "next/cache";
import {
  handleServerActionError,
  ServerActionResult,
} from "@/shared/lib/api/error-handler";
import { AiTransactionService } from "@/shared/services/ai/ai-transaction-service";
import { MockGoogleGenerativeAiService } from "@/shared/services/ai/providers/mocks/mock-google-generative-ai-service";
import { GoogleGenerativeAiService } from "@/shared/services/ai/providers/google-generative-ai-service";
import { getCategoryByName } from "@/features/categories/actions/categories";

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

export async function processAiTransaction(
  transcript: string
): Promise<ServerActionResult<CreateTransactionInput & { suggestedCategory?: { name: string; type: "income" | "expense" } } | { type: "request_details"; message: string }>> {
  try {
    const aiService = new AiTransactionService(
      process.env.NODE_ENV === "development"
        ? new MockGoogleGenerativeAiService()
        : new GoogleGenerativeAiService()
    );

    const result = await aiService.convertTranscriptToNewTransaction(transcript);

    // Se for uma solicitação de detalhes, retorna a mensagem
    if (result.type === "request_details") {
      return {
        data: {
          type: "request_details",
          message: result.message || "Por favor, forneça os detalhes da transação."
        }
      };
    }

    // Se não tiver transação, retorna erro
    if (!result.transaction) {
      throw new Error("Não foi possível processar a transação");
    }

    let categoryId = "";
    let suggestedCategory;

    try {
      const categoryResponse = await getCategoryByName(result.transaction.category);
      categoryId = categoryResponse?.data?.id ?? "";
    } catch {
      // Se a categoria não existir, incluímos como sugestão
      suggestedCategory = {
        name: result.transaction.category,
        type: result.transaction.amount > 0 ? "income" : "expense"
      };
    }

    return {
      data: {
        title: result.transaction.title,
        amount: result.transaction.amount,
        dateTime: result.transaction.dateTime,
        categoryId,
        suggestedCategory
      },
    };
  } catch (error) {
    console.error("Error processing AI transaction:", error);
    return handleServerActionError(error);
  }
}
