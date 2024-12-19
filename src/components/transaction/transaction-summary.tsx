import { Card } from "../ui/card";
import { memo, Suspense, cache } from "react";
import { Skeleton } from "../ui/skeleton";
import { TransactionService } from "@/src/services/transaction-service";
import { formatNumberToBRL } from "@/src/lib/utils";
import { ArrowDownRight, ArrowUpRight, Coins } from "lucide-react";

type SummaryCardProps = {
  title: string;
  value: number;
  type: "income" | "expense" | "total";
};

const getSummary = cache(async () => {
  const { data } = await new TransactionService().getSummary();
  return data;
});

export const TransactionSummary = memo(async () => {
  const summary = await getSummary();

  return (
    <Suspense fallback={<TransactionSummarySkeleton />}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Entradas" value={summary.income} type="income" />
        <SummaryCard title="Saídas" value={summary.expense} type="expense" />
        <SummaryCard title="Total" value={summary.total} type="total" />
      </div>
    </Suspense>
  );
});

const TransactionSummarySkeleton = memo(() => {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-32" />
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

const SummaryCard = memo(({ title, value, type }: SummaryCardProps) => {
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
