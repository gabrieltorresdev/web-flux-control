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

  public async findAllPaginated(
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiTransactionPaginatedList> {
    const params = new URLSearchParams();
    if (startDate) {
      params.append("startDate", startDate.toISOString());
    }
    if (endDate) {
      params.append("endDate", endDate.toISOString());
    }

    return this.httpClient.get<ApiTransactionPaginatedList>(
      `${getBackendApiUrl(this.route)}?${params.toString()}`
    );
  }

  public async create(transaction: CreateTransactionInput) {
    return this.httpClient.post(getBackendApiUrl(this.route), transaction);
  }

  public async update(id: string, transaction: CreateTransactionInput) {
    return this.httpClient.put(
      `${getBackendApiUrl(this.route)}/${id}`,
      transaction
    );
  }

  public async delete(id: string) {
    return this.httpClient.delete(`${getBackendApiUrl(this.route)}/${id}`);
  }

  public async getSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiTransactionSummaryResponse> {
    const params = new URLSearchParams();
    if (startDate) {
      params.append("startDate", startDate.toISOString());
    }
    if (endDate) {
      params.append("endDate", endDate.toISOString());
    }

    return this.httpClient.get<ApiTransactionSummaryResponse>(
      `${getBackendApiUrl(this.route)}/summary?${params.toString()}`
    );
  }
}
