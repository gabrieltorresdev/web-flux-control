import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrentBalance } from "@/components/dashboard/overview/current-balance";
import { MonthlyIncomeExpense } from "@/components/dashboard/overview/monthly-income-expense";
import { CreditAndLoans } from "@/components/dashboard/overview/credit-and-loans";
import { FinancialGoals } from "@/components/dashboard/overview/financial-goals";
import { DashboardOverviewRecentTransactions } from "@/components/dashboard/overview/recent-transactions";
import { BudgetOverview } from "@/components/dashboard/overview/budget-overview";
import { Separator } from "@/components/ui/separator";

export function FinancialOverview() {
  return (
    <div className="flex h-full">
      <div className="grid grid-flow-row grid-cols-1 gap-6 xl:grid-cols-12 flex-1">
        <Card className="w-full shadow-none xl:col-span-6">
          <CardHeader>
            <CardTitle className="text-xl">Visão Geral Financeira</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <CurrentBalance />
            <Separator />
            <MonthlyIncomeExpense />
            <Separator />
            <CreditAndLoans />
          </CardContent>
        </Card>

        <div className="w-full xl:col-span-6">
          <DashboardOverviewRecentTransactions />
        </div>
      </div>
    </div>
  );
}
