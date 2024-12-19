import { formatDateHeader } from "@/src/lib/utils/transactions";
import { Transaction } from "@/src/types/transaction";
import { memo } from "react";
import { Suspense } from "react";
import { TransactionService } from "@/src/services/transaction-service";
import { groupTransactionsByDate } from "@/src/lib/utils/transactions";
import { ChevronRight, CircleDollarSign } from "lucide-react";
import { Card } from "../ui/card";
import { TransactionItem } from "./transaction-item";
import { formatNumberToBRL } from "@/src/lib/utils";

interface TransactionGroupProps {
  date: Date;
  transactions: Transaction[];
}

async function getTransactions() {
  const { data } = await new TransactionService().findAllPaginated();
  return groupTransactionsByDate(data);
}

export const TransactionList = memo(async () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <TransactionListContent />
    </Suspense>
  );
});

export async function TransactionListContent() {
  const groupedTransactions = await getTransactions();

  if (!groupedTransactions.length) {
    return <EmptyState />;
  }

  return (
    <div className="animate-in fade-in-50 duration-500 space-y-3 max-w-3xl">
      {groupedTransactions.map((group) => (
        <TransactionGroup key={group.date.toISOString()} {...group} />
      ))}
    </div>
  );
}

const EmptyState = memo(() => (
  <div
    className="flex flex-col items-center justify-center h-64 space-y-4 animate-in fade-in-50"
    role="status"
  >
    <CircleDollarSign
      className="h-12 w-12 text-muted-foreground/50"
      aria-hidden="true"
    />
    <p className="text-muted-foreground text-center">
      Nenhuma transação encontrada
    </p>
  </div>
));

const LoadingState = memo(() => (
  <div className="space-y-3 animate-pulse">
    {[...Array(2)].map((_, groupIndex) => (
      <section key={groupIndex} className="space-y-3">
        <div className="sticky top-0 z-10 bg-gray-100/70 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(3)].map((_, itemIndex) => (
            <div
              key={itemIndex}
              className="p-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
));

const TransactionGroup = memo(
  ({ date, transactions }: TransactionGroupProps) => {
    const dailyBalance = transactions.reduce((acc, transaction) => {
      return (
        acc +
        (transaction.category.type === "income"
          ? transaction.amount
          : -transaction.amount)
      );
    }, 0);

    return (
      <section
        className="space-y-3"
        role="region"
        aria-label={`Transações de ${formatDateHeader(date)}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-700">
            {formatDateHeader(date)}
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                dailyBalance >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {formatNumberToBRL(dailyBalance)}
            </span>
            <ChevronRight
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
        </div>
        <Card className="overflow-hidden" role="list">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </Card>
      </section>
    );
  }
);

TransactionGroup.displayName = "TransactionGroup";
EmptyState.displayName = "EmptyState";
LoadingState.displayName = "LoadingState";
TransactionList.displayName = "TransactionList";
