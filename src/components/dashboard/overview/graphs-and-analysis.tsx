import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseDistributionChart } from "@/components/dashboard/overview/charts/expense-distribution-chart";
import { BalanceEvolutionChart } from "@/components/dashboard/overview/charts/balance-evolution-chart";
import { IncomeExpenseComparisonChart } from "@/components/dashboard/overview/charts/income-expense-comparison-chart";

export default function GraphsAndAnalysis() {
  return (
    <Card className="w-full shadow-none">
      <CardHeader>
        <CardTitle>Gráficos e Análises</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expense-distribution" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 lg:grid-cols-3 h-auto">
            <TabsTrigger value="expense-distribution">
              Distribuição de Gastos
            </TabsTrigger>
            <TabsTrigger value="balance-evolution">
              Evolução do Saldo
            </TabsTrigger>
            <TabsTrigger value="income-expense-comparison">
              Receitas vs. Despesas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="expense-distribution">
            <ExpenseDistributionChart />
          </TabsContent>
          <TabsContent value="balance-evolution">
            <BalanceEvolutionChart />
          </TabsContent>
          <TabsContent value="income-expense-comparison">
            <IncomeExpenseComparisonChart />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
