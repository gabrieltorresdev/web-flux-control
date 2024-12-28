"use client";

import { useEffect, useState } from "react";
import { Budget } from "@/src/types/budget";
import { BudgetService } from "@/src/services/budget-service";
import { formatCurrency } from "@/src/lib/utils";
import { Progress } from "@/src/components/ui/progress";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/src/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Transaction } from "@/src/types/transaction";
import { cn } from "@/src/lib/utils";
import { Eye } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";

type BudgetStatus = {
  status: "normal" | "warning" | "danger";
  percentageUsed: number;
};

export function BudgetList() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [budgetTransactions, setBudgetTransactions] = useState<Transaction[]>(
    []
  );
  const [budgetStatuses, setBudgetStatuses] = useState<
    Record<string, BudgetStatus>
  >({});

  const budgetService = new BudgetService();

  useEffect(() => {
    const loadBudgets = async () => {
      const response = await budgetService.list();
      setBudgets(response.data);

      const statuses: Record<string, BudgetStatus> = {};
      for (const budget of response.data) {
        const status = await budgetService.getBudgetStatus(budget);
        statuses[budget.id] = status;
      }
      setBudgetStatuses(statuses);
    };

    loadBudgets();
  }, []);

  const handleViewTransactions = async (budget: Budget) => {
    setSelectedBudget(budget);
    const transactions = await budgetService.getBudgetTransactions(budget.id);
    setBudgetTransactions(transactions);
  };

  const getProgressColor = (status: BudgetStatus["status"]) => {
    switch (status) {
      case "danger":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {budgets.map((budget) => {
          const available = budget.amount - budget.spent;
          const progress = (budget.spent / budget.amount) * 100;
          const status = budgetStatuses[budget.id];

          return (
            <Card key={budget.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1 break-all">
                      {budget.name}
                    </h3>
                    {budget.category && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>{budget.category.icon}</span>
                        <span>{budget.category.name}</span>
                      </div>
                    )}
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewTransactions(budget)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Transações do Orçamento</SheetTitle>
                        <SheetDescription>
                          {selectedBudget?.name} -{" "}
                          {selectedBudget?.category?.name}
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-8">
                        {budgetTransactions.length === 0 ? (
                          <p className="text-center text-muted-foreground">
                            Nenhuma transação encontrada para este orçamento.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {budgetTransactions.map((transaction) => (
                              <div
                                key={transaction.id}
                                className="flex items-center justify-between border-b pb-4"
                              >
                                <div>
                                  <p className="font-medium">
                                    {transaction.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(
                                      transaction.dateTime,
                                      "dd/MM/yyyy HH:mm",
                                      {
                                        locale: ptBR,
                                      }
                                    )}
                                  </p>
                                </div>
                                <p
                                  className={cn(
                                    "font-medium",
                                    transaction.amount < 0
                                      ? "text-red-500"
                                      : "text-green-500"
                                  )}
                                >
                                  {formatCurrency(Math.abs(transaction.amount))}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="space-y-4">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Período:</span>
                      <span>
                        {format(budget.startDate, "dd/MM/yyyy", {
                          locale: ptBR,
                        })}{" "}
                        -{" "}
                        {format(budget.endDate, "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Orçamento:</span>
                      <span className="font-medium">
                        {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gasto:</span>
                      <span className="font-medium">
                        {formatCurrency(budget.spent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Disponível:</span>
                      <span className="font-medium">
                        {formatCurrency(available)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Progresso
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className={cn(status && getProgressColor(status.status))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
