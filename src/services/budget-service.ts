import { v4 as uuidv4 } from "uuid";
import {
  ApiBudgetListResponse,
  ApiBudgetResponse,
  ApiBudgetSummaryResponse,
  Budget,
  CreateBudgetInput,
} from "@/src/types/budget";
import { Transaction } from "@/src/types/transaction";

// Mock data
const mockBudgets: Budget[] = [
  {
    id: uuidv4(),
    name: "Orçamento Mensal de Alimentação",
    amount: 1000,
    spent: 650,
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 31),
    isRecurring: true,
    recurringPeriod: "monthly",
    category: {
      id: "1",
      name: "Alimentação",
      type: "expense",
      icon: "🍽️",
      is_default: false,
    },
  },
  {
    id: uuidv4(),
    name: "Orçamento de Lazer",
    amount: 500,
    spent: 200,
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 31),
    isRecurring: true,
    recurringPeriod: "monthly",
    category: {
      id: "2",
      name: "Lazer",
      type: "expense",
      icon: "🎮",
      is_default: false,
    },
  },
];

export class BudgetService {
  private calculateSpentAmount(
    budget: Budget,
    transactions: Transaction[]
  ): number {
    return transactions
      .filter(
        (transaction) =>
          transaction.category?.id === budget.category?.id &&
          new Date(transaction.dateTime) >= budget.startDate &&
          new Date(transaction.dateTime) <= budget.endDate &&
          transaction.amount < 0
      )
      .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
  }

  private getTransactionsForBudget(
    budget: Budget,
    transactions: Transaction[]
  ): Transaction[] {
    return transactions.filter(
      (transaction) =>
        transaction.category?.id === budget.category?.id &&
        new Date(transaction.dateTime) >= budget.startDate &&
        new Date(transaction.dateTime) <= budget.endDate &&
        transaction.amount < 0
    );
  }

  private createRecurringBudgets(budget: Budget): Budget[] {
    const recurringBudgets: Budget[] = [];
    let currentDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);

    for (let i = 0; i < 3; i++) {
      const nextStartDate = new Date(currentDate);
      const nextEndDate = new Date(endDate);

      if (budget.recurringPeriod === "monthly") {
        nextStartDate.setMonth(nextStartDate.getMonth() + 1);
        nextEndDate.setMonth(nextEndDate.getMonth() + 1);
      } else {
        nextStartDate.setFullYear(nextStartDate.getFullYear() + 1);
        nextEndDate.setFullYear(nextEndDate.getFullYear() + 1);
      }

      const newBudget: Budget = {
        ...budget,
        id: uuidv4(),
        startDate: nextStartDate,
        endDate: nextEndDate,
        spent: 0,
      };

      recurringBudgets.push(newBudget);
      currentDate = nextStartDate;
    }

    return recurringBudgets;
  }

  async create(input: CreateBudgetInput): Promise<ApiBudgetResponse> {
    const newBudget: Budget = {
      ...input,
      id: uuidv4(),
      spent: 0,
      category: input.categoryId
        ? {
            id: input.categoryId,
            name: "Categoria Mock",
            type: "expense",
            icon: "📊",
            is_default: false,
          }
        : undefined,
    };

    mockBudgets.push(newBudget);

    if (input.isRecurring) {
      const recurringBudgets = this.createRecurringBudgets(newBudget);
      mockBudgets.push(...recurringBudgets);
    }

    return { data: newBudget };
  }

  async list(): Promise<ApiBudgetListResponse> {
    return { data: mockBudgets };
  }

  async getSummary(): Promise<ApiBudgetSummaryResponse> {
    const totalBudget = mockBudgets.reduce(
      (sum, budget) => sum + budget.amount,
      0
    );
    const totalSpent = mockBudgets.reduce(
      (sum, budget) => sum + budget.spent,
      0
    );

    return {
      data: {
        totalBudget,
        totalSpent,
        remainingBudget: totalBudget - totalSpent,
        budgetCount: mockBudgets.length,
      },
    };
  }

  async getById(id: string): Promise<ApiBudgetResponse> {
    const budget = mockBudgets.find((b) => b.id === id);
    if (!budget) {
      throw new Error("Orçamento não encontrado");
    }
    return { data: budget };
  }

  async delete(id: string): Promise<void> {
    const index = mockBudgets.findIndex((b) => b.id === id);
    if (index > -1) {
      mockBudgets.splice(index, 1);
    }
  }

  async update(
    id: string,
    input: Partial<CreateBudgetInput>
  ): Promise<ApiBudgetResponse> {
    const budget = mockBudgets.find((b) => b.id === id);
    if (!budget) {
      throw new Error("Orçamento não encontrado");
    }

    Object.assign(budget, input);

    if (input.isRecurring && !budget.isRecurring) {
      const recurringBudgets = this.createRecurringBudgets(budget);
      mockBudgets.push(...recurringBudgets);
    }

    return { data: budget };
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

  async getBudgetTransactions(_budgetId: string): Promise<Transaction[]> {
    // Em um cenário real, você buscaria as transações da API usando o budgetId
    return [];
  }

  async updateBudgetSpent(transaction: Transaction): Promise<void> {
    const budgets = mockBudgets.filter(
      (budget) =>
        budget.category?.id === transaction.category?.id &&
        new Date(transaction.dateTime) >= budget.startDate &&
        new Date(transaction.dateTime) <= budget.endDate
    );

    for (const budget of budgets) {
      if (transaction.amount < 0) {
        budget.spent += Math.abs(transaction.amount);
      }
    }
  }
}
