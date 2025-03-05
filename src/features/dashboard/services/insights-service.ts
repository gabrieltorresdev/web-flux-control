import { HttpClient } from "@/shared/lib/api/http-client";
import { getBackendApiUrl } from "@/shared/lib/config";

export interface InsightItem {
  type: 'success' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  comparison: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  metadata: {
    period: string;
    actionUrl?: string;
    actionLabel?: string;
  };
}

export interface InsightsResponse {
  data: InsightItem[];
}

export class InsightsService {
  private static instance: InsightsService;
  private httpClient: HttpClient;
  private readonly route = 'dashboard/insights';

  private constructor() {
    this.httpClient = new HttpClient();
  }

  public static getInstance(): InsightsService {
    if (!InsightsService.instance) {
      InsightsService.instance = new InsightsService();
    }
    return InsightsService.instance;
  }

  async getInsights(startDate: string, endDate: string): Promise<InsightsResponse> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });

    return this.httpClient.get<InsightsResponse>(
      `${getBackendApiUrl(this.route)}?${params.toString()}`,
      true
    );
  }

  async getInsightsByCategory(category: string): Promise<InsightsResponse> {
    return this.httpClient.get<InsightsResponse>(
      `${getBackendApiUrl(this.route)}?category=${category}`,
      true
    );
  }

  async getInsightsByDateRange(startDate: Date, endDate: Date): Promise<InsightsResponse> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    return this.httpClient.get<InsightsResponse>(
      `${getBackendApiUrl(this.route)}?${params.toString()}`,
      true
    );
  }
} 