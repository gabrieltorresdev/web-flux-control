"use client";

import { Card } from "../ui/card";
import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react";
import type { TransactionSummary } from "@/hooks/use-transactions";

type TransactionSummaryProps = {
  summary: TransactionSummary;
};

export function TransactionSummary({ summary }: TransactionSummaryProps) {
  const formatCurrency = (value: number) => {
    const isNegative = value < 0;
    return `${isNegative ? "-" : ""}${new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(value))}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Entradas</p>
            <h2 className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.income)}
            </h2>
          </div>
          <div className="p-2 bg-green-100 rounded-full">
            <ArrowUpRight className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Saídas</p>
            <h2 className="text-2xl font-bold text-red-600">
              {formatCurrency(-summary.expense)}
            </h2>
          </div>
          <div className="p-2 bg-red-100 rounded-full">
            <ArrowDownRight className="w-5 h-5 text-red-600" />
          </div>
        </div>
      </Card>

      <Card className="p-4 lg:col-span-2 xl:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <h2
              className={`text-2xl font-bold ${
                summary.total >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(summary.total)}
            </h2>
          </div>
          <div
            className={`p-2 rounded-full ${
              summary.total >= 0 ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <DollarSign
              className={`w-5 h-5 ${
                summary.total >= 0 ? "text-green-600" : "text-red-600"
              }`}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
