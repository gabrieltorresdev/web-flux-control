"use client";

import { memo } from "react";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import type { TransactionSummary as Summary } from "@/hooks/use-transactions";
import { SummaryCard } from "./summary-card";
import { useCurrencyFormatter } from "./use-currency-formatter";

interface TransactionSummaryProps {
  summary: Summary;
  isLoading?: boolean;
}

function TransactionSummaryComponent({
  summary,
  isLoading,
}: TransactionSummaryProps) {
  const formatCurrency = useCurrencyFormatter();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SummaryCard
        title="Entradas"
        value={formatCurrency(summary.income)}
        icon={ArrowUpRight}
        variant="income"
        isLoading={isLoading}
      />
      <SummaryCard
        title="Saídas"
        value={formatCurrency(summary.expense)}
        icon={ArrowDownRight}
        variant="expense"
        isLoading={isLoading}
      />
      <SummaryCard
        title="Total"
        value={formatCurrency(summary.total)}
        icon={Wallet}
        variant="default"
        isLoading={isLoading}
      />
    </div>
  );
}

export const TransactionSummary = memo(TransactionSummaryComponent);
