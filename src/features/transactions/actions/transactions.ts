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

type TransactionListParams = {
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
): Promise<ServerActionResult<CreateTransactionInput & { suggestedCategory?: string }>> {
  try {
    const aiService = new AiTransactionService(
      process.env.NODE_ENV === "development"
        ? new MockGoogleGenerativeAiService()
        : new GoogleGenerativeAiService()
    );

    const aiTransaction = await aiService.convertTranscriptToNewTransaction(
      transcript
    );

    let categoryId = "";
    let suggestedCategory = undefined;
    
    try {
      // Tentar encontrar a categoria pelo nome sugerido pela IA
      const categoryResponse = await getCategoryByName(aiTransaction.category);
      categoryId = categoryResponse?.data?.id ?? "";
      
      // Se a categoria existir, não precisamos sugerir
      // Se não existir, armazenamos como sugestão
      if (!categoryId && aiTransaction.category) {
        suggestedCategory = aiTransaction.category;
      }
    } catch (error) {
      console.error("Erro ao buscar categoria:", error);
      // Se falhar ao buscar a categoria, ainda assim guardamos a sugestão
      if (aiTransaction.category) {
        suggestedCategory = aiTransaction.category;
      }
    }

    return {
      data: {
        title: aiTransaction.title,
        amount: aiTransaction.amount,
        dateTime: aiTransaction.dateTime,
        categoryId, // ID da categoria se existir
        suggestedCategory, // Nome da categoria sugerida se não existir
      },
    };
  } catch (error) {
    console.error("Error processing AI transaction:", error);
    return handleServerActionError(error);
  }
}
