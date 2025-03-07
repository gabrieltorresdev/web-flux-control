"use client";

import { Card } from "@/shared/components/ui/card";
import { formatNumberToBRL } from "@/shared/utils";
import { ArrowDownRight, ArrowUpRight, Coins } from "lucide-react";
import { memo } from "react";
import { cn } from "@/shared/utils";
import { ApiTransactionSummaryResponse } from "@/features/transactions/types";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";

type SummaryCardProps = {
  title: string;
  value: number;
  type: "income" | "expense" | "total";
  isLoading?: boolean;
};

interface TransactionSummaryProps {
  initialSummary: ApiTransactionSummaryResponse;
}

const SUMMARY_STYLES = {
  income: {
    icon: ArrowUpRight,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-500/20",
    title: "Entradas",
  },
  expense: {
    icon: ArrowDownRight,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-500/20",
    title: "Saídas",
  },
  total: {
    icon: Coins,
    color: (value: number) =>
      value >= 0
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400",
    bgColor: "bg-primary/10 dark:bg-primary/20",
    title: "Total",
  },
} as const;

const SummaryCard = memo(function SummaryCard({
  title,
  value,
  type,
  isLoading,
}: SummaryCardProps) {
  const Icon = SUMMARY_STYLES[type].icon;
  const textColor =
    type === "total"
      ? SUMMARY_STYLES[type].color(value)
      : SUMMARY_STYLES[type].color;
  const bgColor = SUMMARY_STYLES[type].bgColor;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center",
          bgColor
        )}
      >
        <Icon className={cn(textColor, isLoading && "opacity-50")} />
      </div>
      <div className="text-center">
        <span className="text-xs text-muted-foreground block">{title}</span>
        <p
          className={cn(
            "text-xs md:text-sm font-semibold",
            textColor,
            isLoading && "opacity-50"
          )}
        >
          {formatNumberToBRL(value)}
        </p>
      </div>
    </div>
  );
});

const SummaryContent = memo(function SummaryContent({
  summary,
  isLoading,
}: {
  summary: ApiTransactionSummaryResponse;
  isLoading: boolean;
}) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {(["income", "expense", "total"] as const).map((type) => (
          <Card
            key={type}
            className={cn(
              "p-3",
              isLoading && "animate-pulse"
            )}
          >
            <SummaryCard
              title={SUMMARY_STYLES[type].title}
              value={summary.data[type]}
              type={type}
              isLoading={isLoading}
            />
          </Card>
        ))}
      </div>
    </div>
  );
});

export function TransactionSummary({
  initialSummary,
}: TransactionSummaryProps) {
  const { isLoading } = useTransactions();

  return <SummaryContent summary={initialSummary} isLoading={isLoading} />;
}
