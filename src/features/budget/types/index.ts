import { Category } from "@/features/categories/types";

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category?: Category;
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  recurringPeriod?: "monthly" | "yearly";
}

export interface CreateBudgetInput
  extends Omit<Budget, "id" | "spent" | "category"> {
  categoryId?: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetCount: number;
}

export interface ApiBudgetResponse {
  data: Budget;
}

export interface ApiBudgetListResponse {
  data: Budget[];
}

export interface ApiBudgetSummaryResponse {
  data: BudgetSummary;
}
