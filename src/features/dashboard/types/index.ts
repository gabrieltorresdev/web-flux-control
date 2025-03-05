interface MonthlyFinancialSummary {
  totalBudget: number;
  totalSpent: number;
  availableBudget: number;
  remainingBudget: number;
}

interface CategoryExpense {
  name: string;
  amount: number;
  percentage: number;
}

interface CategorySpending {
  category: string;
  amount: number;
  color: string;
  percentage: number;
}

interface CategoryBudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  percentage: number;
}

interface SpendingDataPoint {
  month: string;
  amount: number;
}

interface IncomeExpenseData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

interface SavingsDataPoint {
  month: string;
  amount: number;
  goal: number;
}

export interface DashboardData {
  currentMonth: MonthlyFinancialSummary & {
    expensesByCategory: CategoryExpense[];
    categorySpending: CategorySpending[];
    categoryBudgetComparison: CategoryBudgetComparison[];
  };
  nextMonth: {
    expectedIncome: number;
    projectedExpenses: number;
  };
  historicalData: {
    monthlySpending: SpendingDataPoint[];
    incomeVsExpenses: IncomeExpenseData[];
    savingsGrowth: SavingsDataPoint[];
  };
} 