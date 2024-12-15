import { HttpClient } from "@/lib/api/http-client";
import { getApiUrl } from "@/lib/config";
import {
  ApiResponse,
  ApiTransaction,
  ApiTransactionResponse,
  CreateTransactionDTO,
} from "@/types/api";
import {
  Transaction,
  TransactionInput,
  TransactionFilters,
  TransactionSummary,
} from "@/types/transaction";

export class ApiTransactionService {
  private static mapToTransaction(apiTransaction: ApiTransaction): Transaction {
    return {
      id: apiTransaction.id,
      title: apiTransaction.title,
      amount: apiTransaction.amount,
      category: {
        id: apiTransaction.category.id,
        name: apiTransaction.category.name,
        type: apiTransaction.category.type,
      },
      date: apiTransaction.dateTime.split("T")[0],
      time: new Date(apiTransaction.dateTime).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  private static mapToCreateDTO(input: TransactionInput): CreateTransactionDTO {
    return {
      categoryId: input.categoryId,
      amount: input.amount,
      dateTime: new Date(`${input.date}T${input.time}:00Z`).toISOString(),
      title: input.title,
    };
  }

  async getAll(filters?: TransactionFilters): Promise<ApiTransactionResponse> {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.set(key, value.toString());
      });
    }

    const url = getApiUrl(`transactions?${queryParams.toString()}`);

    return HttpClient.get<ApiTransactionResponse>(url);
  }

  async getSummary(startDate: string, endDate: string): Promise<TransactionSummary> {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });

    const url = getApiUrl(`transactions/summary?${queryParams.toString()}`);
    const response = await HttpClient.get<ApiResponse<TransactionSummary>>(url);
    return response.data;
  }

  async create(input: TransactionInput): Promise<Transaction> {
    const url = getApiUrl("transactions");
    const dto = ApiTransactionService.mapToCreateDTO(input);
    const response = await HttpClient.post<ApiResponse<ApiTransaction>>(
      url,
      dto
    );
    return ApiTransactionService.mapToTransaction(response.data);
  }

  async update(id: string, input: TransactionInput): Promise<Transaction> {
    const url = getApiUrl(`transactions/${id}`);
    const dto = ApiTransactionService.mapToCreateDTO(input);
    const transaction = await HttpClient.put<ApiTransaction>(url, dto);
    return ApiTransactionService.mapToTransaction(transaction);
  }

  async delete(id: string): Promise<void> {
    const url = getApiUrl(`transactions/${id}`);
    await HttpClient.delete(url);
  }
}