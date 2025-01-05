import { HttpClient } from "@/lib/api/http-client";
import { getBackendApiUrl } from "@/lib/config";
import {
  ApiBudgetListResponse,
  ApiBudgetResponse,
  ApiBudgetSummaryResponse,
  Budget,
  CreateBudgetInput,
} from "@/types/budget";
import { Transaction } from "@/types/transaction";

export class BudgetService {
  private httpClient: HttpClient;
  private route: string;

  constructor() {
    this.httpClient = new HttpClient();
    this.route = "budgets";
  }

  async create(input: CreateBudgetInput): Promise<ApiBudgetResponse> {
    return this.httpClient.post<ApiBudgetResponse, CreateBudgetInput>(
      getBackendApiUrl(this.route),
      input,
      true
    );
  }

  async list(): Promise<ApiBudgetListResponse> {
    return this.httpClient.get<ApiBudgetListResponse>(
      getBackendApiUrl(this.route),
      true
    );
  }

  async getSummary(): Promise<ApiBudgetSummaryResponse> {
    return this.httpClient.get<ApiBudgetSummaryResponse>(
      `${getBackendApiUrl(this.route)}/summary`,
      true
    );
  }

  async getById(id: string): Promise<ApiBudgetResponse> {
    return this.httpClient.get<ApiBudgetResponse>(
      `${getBackendApiUrl(this.route)}/${id}`,
      true
    );
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(`${getBackendApiUrl(this.route)}/${id}`, true);
  }

  async update(
    id: string,
    input: Partial<CreateBudgetInput>
  ): Promise<ApiBudgetResponse> {
    return this.httpClient.put<ApiBudgetResponse, Partial<CreateBudgetInput>>(
      `${getBackendApiUrl(this.route)}/${id}`,
      input,
      true
    );
  }

  async getBudgetStatus(budget: Budget): Promise<{
    status: "normal" | "warning" | "danger";
    percentageUsed: number;
  }> {
    const percentageUsed = (budget.spent / budget.amount) * 100;

    if (percentageUsed >= 90) {
      return { status: "danger", percentageUsed };
    } else if (percentageUsed >= 70) {
      return { status: "warning", percentageUsed };
    }

    return { status: "normal", percentageUsed };
  }

  async getBudgetTransactions(budgetId: string): Promise<Transaction[]> {
    return this.httpClient.get<Transaction[]>(
      `${getBackendApiUrl(this.route)}/${budgetId}/transactions`,
      true
    );
  }

  async updateBudgetSpent(budgetId: string, amount: number): Promise<void> {
    await this.httpClient.post(
      `${getBackendApiUrl(this.route)}/${budgetId}/spent`,
      { amount },
      true
    );
  }
}
