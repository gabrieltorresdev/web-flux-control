import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrentBalance } from "@/components/dashboard/overview/current-balance";
import { MonthlyIncomeExpense } from "@/components/dashboard/overview/monthly-income-expense";
import { CreditAndLoans } from "@/components/dashboard/overview/credit-and-loans";
import GoalsSummary from "@/components/dashboard/overview/goals-summary";
import { FinancialGoals } from "./financial-goals";
import { Separator } from "@/components/ui/separator";
import { DashboardOverviewRecentTransactions } from "./recent-transactions";

type DayTransactions = {
  date: string;
  transactions: {
    description: string;
    time: string;
    amount: string;
    type: "income" | "expense";
    category: {
      name: string;
      color: string;
    };
  }[];
};

const transactionsByDay: DayTransactions[] = [
  {
    date: "2024-11-29",
    transactions: [
      {
        description: "Salário",
        time: "13:40",
        amount: "5000.00",
        type: "income",
        category: {
          name: "Receita",
          color: "hsl(120, 70%, 40%)",
        },
      },
    ],
  },
  {
    date: "2024-11-28",
    transactions: [
      {
        description: "Compra em Mercado Extra",
        time: "16:40",
        amount: "-467.49",
        type: "expense",
        category: {
          name: "Alimentação",
          color: "hsl(200, 80%, 50%)",
        },
      },
      {
        description: "Pagamento Aluguel",
        time: "12:20",
        amount: "-830.00",
        type: "expense",
        category: {
          name: "Moradia",
          color: "hsl(20, 60%, 45%)",
        },
      },
    ],
  },
];

export function FinancialOverview() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Visão Geral Financeira</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="space-y-6 flex-1 lg:col-span-7">
          <CurrentBalance />
          <MonthlyIncomeExpense />
          <CreditAndLoans />
          <GoalsSummary />
        </div>
        {/* <div className="col-span-1 flex justify-center -mt-9">
          <Separator orientation="vertical" />
        </div> */}
        <div className="flex lg:col-span-5">
          <DashboardOverviewRecentTransactions
            transactions={transactionsByDay}
          />
        </div>
      </CardContent>
    </Card>
  );
}
