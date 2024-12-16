"use client";

import { memo } from "react";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { SummaryCard } from "./summary-card";
import { SummarySkeleton } from "./summary-skeleton";
import type { TransactionSummary as Summary } from "@/types/transaction";

interface TransactionSummaryProps {
  summary: Summary;
  isLoading?: boolean;
  error?: Error | null;
}

function TransactionSummaryComponent({
  summary,
  isLoading,
  error,
}: TransactionSummaryProps) {
  if (isLoading) {
    return <SummarySkeleton />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SummaryCard
        title="Entradas"
        value={error ? "---" : summary.income}
        icon={ArrowUpRight}
        variant="income"
        hasError={!!error}
        isLoading={isLoading}
      />
      <SummaryCard
        title="Saídas"
        value={error ? "---" : summary.expense}
        icon={ArrowDownRight}
        variant="expense"
        hasError={!!error}
        isLoading={isLoading}
      />
      <SummaryCard
        title="Total"
        value={error ? "---" : summary.total}
        icon={Wallet}
        variant="default"
        hasError={!!error}
        isLoading={isLoading}
      />
    </div>
  );
}

export const TransactionSummary = memo(TransactionSummaryComponent);
