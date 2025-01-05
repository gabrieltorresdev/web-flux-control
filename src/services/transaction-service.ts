import { HttpClient } from "@/lib/api/http-client";
import { getBackendApiUrl } from "@/lib/config";
import {
  ApiTransactionPaginatedList,
  ApiTransactionSummaryResponse,
  CreateTransactionInput,
  PaginationParams,
} from "@/types/transaction";

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
    search?: string,
    pagination?: PaginationParams
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
    if (pagination?.page) {
      params.append("page", pagination.page.toString());
    }
    if (pagination?.perPage) {
      params.append("perPage", pagination.perPage.toString());
    }

    return this.httpClient.get<ApiTransactionPaginatedList>(
      `${getBackendApiUrl(this.route)}?${params.toString()}`,
      true
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
      `${getBackendApiUrl(this.route)}/summary?${params.toString()}`,
      true
    );
  }

  async create(input: CreateTransactionInput) {
    return this.httpClient.post(getBackendApiUrl(this.route), input, true);
  }

  async update(id: string, input: CreateTransactionInput) {
    return this.httpClient.put(
      `${getBackendApiUrl(this.route)}/${id}`,
      input,
      true
    );
  }

  async delete(id: string) {
    return this.httpClient.delete(
      `${getBackendApiUrl(this.route)}/${id}`,
      true
    );
  }
}
