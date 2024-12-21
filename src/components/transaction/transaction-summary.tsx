import { Card } from "../ui/card";
import { memo, Suspense } from "react";
import { Skeleton } from "../ui/skeleton";
import { TransactionService } from "@/src/services/transaction-service";
import { formatNumberToBRL } from "@/src/lib/utils";
import { ArrowDownRight, ArrowUpRight, Coins } from "lucide-react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { TransactionSummary as TransactionSummaryType } from "@/src/types/transaction";
import { ApiResponse } from "@/src/types/service";
import { getQueryClient } from "@/src/lib/get-query-client";

type SummaryCardProps = {
  title: string;
  value: number;
  type: "income" | "expense" | "total";
};

export const TransactionSummary = memo(async () => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["transactions", "summary"],
    queryFn: () => new TransactionService().getSummary(),
  });

  return (
    <Suspense fallback={<TransactionSummarySkeleton />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TransactionSummaryContent queryClient={queryClient} />
      </HydrationBoundary>
    </Suspense>
  );
});

const TransactionSummaryContent = memo(
  ({ queryClient }: { queryClient: QueryClient }) => {
    const summaryResponse = queryClient.getQueryData<
      ApiResponse<TransactionSummaryType>
    >(["transactions", "summary"]);

    const summary = summaryResponse?.data;

    return (
      <Card className="p-6">
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
  }
);

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
TransactionSummaryContent.displayName = "TransactionSummaryContent";
TransactionSummary.displayName = "TransactionSummary";
TransactionSummarySkeleton.displayName = "TransactionSummarySkeleton";
