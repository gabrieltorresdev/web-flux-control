import { HttpClient } from "@/src/lib/api/http-client";
import { getBackendApiUrl } from "@/src/lib/config";
import {
  ApiTransactionPaginatedList,
  ApiTransactionSummaryResponse,
  CreateTransactionInput,
} from "@/src/types/transaction";

export class TransactionService {
  private httpClient: HttpClient;
  private route: string;

  constructor() {
    this.httpClient = new HttpClient();
    this.route = "transactions";
  }

  async findAllPaginated(
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null,
    search?: string
  ): Promise<ApiTransactionPaginatedList> {
    const params = new URLSearchParams();
    if (startDate) {
      params.append("startDate", startDate.toISOString());
    }
    if (endDate) {
      params.append("endDate", endDate.toISOString());
    }
    if (categoryId) {
      params.append("categoryId", categoryId);
    }
    if (search) {
      params.append("search", search);
    }

    return this.httpClient.get<ApiTransactionPaginatedList>(
      `${getBackendApiUrl(this.route)}?${params.toString()}`
    );
  }

  async getSummary(
    startDate?: Date,
    endDate?: Date,
    categoryId?: string | null,
    search?: string
  ): Promise<ApiTransactionSummaryResponse> {
    const params = new URLSearchParams();
    if (startDate) {
      params.append("startDate", startDate.toISOString());
    }
    if (endDate) {
      params.append("endDate", endDate.toISOString());
    }
    if (categoryId) {
      params.append("categoryId", categoryId);
    }
    if (search) {
      params.append("search", search);
    }

    return this.httpClient.get<ApiTransactionSummaryResponse>(
      `${getBackendApiUrl(this.route)}/summary?${params.toString()}`
    );
  }

  async create(input: CreateTransactionInput) {
    return this.httpClient.post(getBackendApiUrl(this.route), input);
  }

  async update(id: string, input: CreateTransactionInput) {
    return this.httpClient.put(`${getBackendApiUrl(this.route)}/${id}`, input);
  }

  async delete(id: string) {
    return this.httpClient.delete(`${getBackendApiUrl(this.route)}/${id}`);
  }
}
