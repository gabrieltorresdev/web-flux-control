"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetService } from "@/services/budget-service";
import { BudgetSummary as IBudgetSummary } from "@/types/budget";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";

export function BudgetSummary() {
  const [summary, setSummary] = useState<IBudgetSummary | null>(null);
  const [alerts, setAlerts] = useState<
    {
      id: string;
      name: string;
      percentageUsed: number;
      status: "warning" | "danger";
    }[]
  >([]);

  const [carouselRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });

  const budgetService = new BudgetService();

  useEffect(() => {
    const loadData = async () => {
      const summaryResponse = await budgetService.getSummary();
      setSummary(summaryResponse.data);

      const budgetsResponse = await budgetService.list();
      const newAlerts = [];

      for (const budget of budgetsResponse.data) {
        const status = await budgetService.getBudgetStatus(budget);
        if (status.status !== "normal") {
          newAlerts.push({
            id: budget.id,
            name: budget.name,
            percentageUsed: status.percentageUsed,
            status: status.status,
          });
        }
      }

      setAlerts(newAlerts);
    };

    loadData();
  }, []);

  if (!summary) {
    return null;
  }

  const spentPercentage = (summary.totalSpent / summary.totalBudget) * 100;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden" ref={carouselRef}>
        <div className="flex gap-4 touch-pan-y">
          <Card className="min-w-[80%] md:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(25%-0.75rem)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Orçamento Total
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.totalBudget)}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-[80%] md:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(25%-0.75rem)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.totalSpent)}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-[80%] md:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(25%-0.75rem)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saldo Disponível
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.remainingBudget)}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-[80%] md:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(25%-0.75rem)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {spentPercentage.toFixed(1)}%
              </div>
              <Progress value={spentPercentage} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={alert.status === "danger" ? "destructive" : "default"}
              className={cn(
                alert.status === "warning" &&
                  "border-yellow-500 text-yellow-500"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                {alert.status === "danger" ? "Limite Excedido" : "Atenção"}
              </AlertTitle>
              <AlertDescription>
                O orçamento &ldquo;{alert.name}&rdquo; está com{" "}
                {alert.percentageUsed.toFixed(1)}% do limite{" "}
                {alert.status === "danger" ? "excedido" : "utilizado"}.
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
