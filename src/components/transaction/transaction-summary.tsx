"use client";

import * as React from "react";
import { Card } from "../ui/card";
import { formatNumberToBRL } from "@/src/lib/utils";
import { ArrowDownRight, ArrowUpRight, Coins } from "lucide-react";
import { useTransactionSummary } from "@/src/hooks/use-transactions";
import { Skeleton } from "../ui/skeleton";

type SummaryCardProps = {
  title: string;
  value: number;
  type: "income" | "expense" | "total";
};

export const TransactionSummary = React.memo(function TransactionSummary() {
  const {
    data: summaryResponse,
    isLoading,
    isFetching,
  } = useTransactionSummary();

  if (isLoading || isFetching) {
    return <TransactionSummarySkeleton />;
  }

  const summary = summaryResponse?.data;

  return (
    <Card className="p-3 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Entradas"
          value={summary?.income ?? 0}
          type="income"
        />
        <SummaryCard
          title="Saídas"
          value={summary?.expense ?? 0}
          type="expense"
        />
        <SummaryCard title="Total" value={summary?.total ?? 0} type="total" />
      </div>
    </Card>
  );
});

const TransactionSummarySkeleton = React.memo(() => {
  return (
    <Card className="p-3 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between sm:block space-y-0 sm:space-y-1"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-7 sm:h-8 w-24 sm:w-28" />
          </div>
        ))}
      </div>
    </Card>
  );
});

const styles = {
  income: {
    icon: ArrowUpRight,
    color: "text-green-500",
  },
  expense: {
    icon: ArrowDownRight,
    color: "text-red-500",
  },
  total: {
    icon: Coins,
    color: (value: number) => (value >= 0 ? "text-green-500" : "text-red-500"),
  },
} as const;

const SummaryCard = React.memo(({ title, value, type }: SummaryCardProps) => {
  const Icon = styles[type].icon;
  const textColor =
    type === "total" ? styles[type].color(value) : styles[type].color;

  return (
    <div className="flex items-center justify-between sm:block space-y-0 sm:space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={`h-4 w-4 ${textColor}`} />
        <span>{title}</span>
      </div>
      <p className={`text-lg sm:text-xl font-medium ${textColor}`}>
        {formatNumberToBRL(value)}
      </p>
    </div>
  );
});

SummaryCard.displayName = "SummaryCard";
TransactionSummary.displayName = "TransactionSummary";
TransactionSummarySkeleton.displayName = "TransactionSummarySkeleton";
