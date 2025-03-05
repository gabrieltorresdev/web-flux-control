"use server";

import { InsightsService, InsightsResponse } from "../services/insights-service";

interface GetInsightsParams {
  month?: string;
  year?: string;
}

export async function getInsights(params?: GetInsightsParams): Promise<InsightsResponse> {
  try {
    const today = new Date();
    const month = params?.month ? parseInt(params.month) - 1 : today.getMonth();
    const year = params?.year ? parseInt(params.year) : today.getFullYear();

    const date = new Date(year, month);
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    const insightsService = InsightsService.getInstance();
    const response = await insightsService.getInsights(formattedStartDate, formattedEndDate);
    
    return response;
  } catch (error) {
    console.error("Failed to fetch insights:", error);
    throw error;
  }
}

async function getInsightsByCategory(category: string): Promise<InsightsResponse> {
  try {
    const insightsService = InsightsService.getInstance();
    const response = await insightsService.getInsightsByCategory(category);
    
    return response;
  } catch (error) {
    console.error(`Failed to fetch insights for category ${category}:`, error);
    throw error;
  }
}

async function getInsightsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<InsightsResponse> {
  try {
    const insightsService = InsightsService.getInstance();
    const response = await insightsService.getInsightsByDateRange(startDate, endDate);
    
    return response;
  } catch (error) {
    console.error("Failed to fetch insights by date range:", error);
    throw error;
  }
} 