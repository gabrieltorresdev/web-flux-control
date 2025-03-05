import { DashboardData } from "@/features/dashboard/types";

export async function getDashboardData(): Promise<DashboardData> {
  // This would normally fetch data from an API
  // For now, we'll return mock data
  
  return {
    currentMonth: {
      totalBudget: 5000,
      totalSpent: 3250,
      availableBudget: 1750,
      remainingBudget: 1750,
      expensesByCategory: [
        { name: "Alimentação", amount: 1200, percentage: 36.92 },
        { name: "Moradia", amount: 800, percentage: 24.62 },
        { name: "Transporte", amount: 600, percentage: 18.46 },
        { name: "Lazer", amount: 350, percentage: 10.77 },
        { name: "Saúde", amount: 300, percentage: 9.23 },
      ],
      categorySpending: [
        { category: "Alimentação", amount: 1200, color: "hsl(var(--primary))", percentage: 36.92 },
        { category: "Moradia", amount: 800, color: "hsl(var(--destructive))", percentage: 24.62 },
        { category: "Transporte", amount: 600, color: "hsl(var(--warning))", percentage: 18.46 },
        { category: "Lazer", amount: 350, color: "hsl(var(--success))", percentage: 10.77 },
        { category: "Saúde", amount: 300, color: "hsl(var(--accent))", percentage: 9.23 },
      ],
      categoryBudgetComparison: [
        { category: "Alimentação", budgeted: 1000, actual: 1200, percentage: 120 },
        { category: "Moradia", budgeted: 1000, actual: 800, percentage: 80 },
        { category: "Transporte", budgeted: 500, actual: 600, percentage: 120 },
        { category: "Lazer", budgeted: 300, actual: 350, percentage: 116.67 },
        { category: "Saúde", budgeted: 400, actual: 300, percentage: 75 },
      ],
    },
    nextMonth: {
      expectedIncome: 6000,
      projectedExpenses: 3800,
    },
    historicalData: {
      monthlySpending: [
        { month: "Jan", amount: 3450 },
        { month: "Fev", amount: 3200 },
        { month: "Mar", amount: 3600 },
        { month: "Abr", amount: 3100 },
        { month: "Mai", amount: 3800 },
        { month: "Jun", amount: 3250 },
      ],
      incomeVsExpenses: [
        { month: "Jan", income: 5500, expenses: 3450, balance: 2050 },
        { month: "Fev", income: 5500, expenses: 3200, balance: 2300 },
        { month: "Mar", income: 5800, expenses: 3600, balance: 2200 },
        { month: "Abr", income: 5800, expenses: 3100, balance: 2700 },
        { month: "Mai", income: 5800, expenses: 3800, balance: 2000 },
        { month: "Jun", income: 6000, expenses: 3250, balance: 2750 },
      ],
      savingsGrowth: [
        { month: "Jan", amount: 2050, goal: 10000 },
        { month: "Fev", amount: 4350, goal: 10000 },
        { month: "Mar", amount: 6550, goal: 10000 },
        { month: "Abr", amount: 9250, goal: 10000 },
        { month: "Mai", amount: 11250, goal: 10000 },
        { month: "Jun", amount: 14000, goal: 10000 },
      ],
    },
  };
} 