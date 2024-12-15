import {
  Transaction,
  TransactionInput,
  TransactionFilters,
  TransactionSummary,
} from "../types/transaction";
import { ApiTransactionService } from "./api/transaction-service";
import { ApiTransactionResponse } from "@/types/api";

export class TransactionService {
  private apiService: ApiTransactionService;

  constructor() {
    this.apiService = new ApiTransactionService();
  }

  async getAll(filters?: TransactionFilters): Promise<ApiTransactionResponse> {
    return this.apiService.getAll(filters);
  }

  async getSummary(startDate: string, endDate: string): Promise<TransactionSummary> {
    return this.apiService.getSummary(startDate, endDate);
  }

  async create(transaction: TransactionInput): Promise<Transaction> {
    return this.apiService.create(transaction);
  }

  async update(id: string, data: TransactionInput): Promise<Transaction> {
    return this.apiService.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.apiService.delete(id);
  }
}