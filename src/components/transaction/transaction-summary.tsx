"use client";

import { memo } from "react";
import { Card } from "../ui/card";
import { formatNumberToBRL } from "@/src/lib/utils";
import { ArrowDownRight, ArrowUpRight, Coins } from "lucide-react";
import { useTransactions } from "@/src/hooks/use-transactions";
import { Skeleton } from "../ui/skeleton";
import { ErrorState } from "../ui/error-state";
import { cn } from "@/src/lib/utils";

type SummaryCardProps = {
  title: string;
  value: number;
  type: "income" | "expense" | "total";
};

export const TransactionSummary = memo(function TransactionSummary() {
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useTransactions();

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar resumo"
        description="Não foi possível carregar o resumo das transações. Por favor, tente novamente."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading || isFetching) {
    return <TransactionSummarySkeleton />;
  }

  const summary = response?.summary?.data;

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-gradient-to-br from-background to-muted/20">
          <SummaryCard
            title="Entradas"
            value={summary?.income ?? 0}
            type="income"
          />
        </Card>
        <Card className="p-3 bg-gradient-to-br from-background to-muted/20">
          <SummaryCard
            title="Saídas"
            value={summary?.expense ?? 0}
            type="expense"
          />
        </Card>
        <Card className="p-3 bg-gradient-to-br from-background to-muted/20">
          <SummaryCard title="Total" value={summary?.total ?? 0} type="total" />
        </Card>
      </div>
    </div>
  );
});

const TransactionSummarySkeleton = memo(() => {
  return (
    <div>
      <div className="grid grid-cols-3 gap-1.5">
        <Card className="p-3 bg-gradient-to-br from-background to-muted/20">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-lg" />
            <div className="flex flex-col items-center">
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-4 md:h-5 w-24" />
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-background to-muted/20">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-lg" />
            <div className="flex flex-col items-center">
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-4 md:h-5 w-24" />
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-background to-muted/20">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-lg" />
            <div className="flex flex-col items-center">
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-4 md:h-5 w-24" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});

const styles = {
  income: {
    icon: ArrowUpRight,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  expense: {
    icon: ArrowDownRight,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  total: {
    icon: Coins,
    color: (value: number) => (value >= 0 ? "text-green-500" : "text-red-500"),
    bgColor: "bg-primary/10",
  },
} as const;

const SummaryCard = memo(({ title, value, type }: SummaryCardProps) => {
  const Icon = styles[type].icon;
  const textColor =
    type === "total" ? styles[type].color(value) : styles[type].color;
  const bgColor = styles[type].bgColor;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "w-6 h-6 rounded-lg flex items-center justify-center",
          bgColor
        )}
      >
        <Icon className={cn("h-4 w-4", textColor)} />
      </div>
      <div className="text-center">
        <span className="text-xs text-muted-foreground block">{title}</span>
        <p className={cn("text-xs md:text-sm font-semibold", textColor)}>
          {formatNumberToBRL(value)}
        </p>
      </div>
    </div>
  );
});

SummaryCard.displayName = "SummaryCard";
TransactionSummary.displayName = "TransactionSummary";
TransactionSummarySkeleton.displayName = "TransactionSummarySkeleton";
