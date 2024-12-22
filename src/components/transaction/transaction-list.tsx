"use client";

import * as React from "react";
import { ChevronRight, CircleDollarSign } from "lucide-react";
import { Card } from "../ui/card";
import { TransactionItem } from "./transaction-item";
import { formatNumberToBRL } from "@/src/lib/utils";
import { Transaction } from "@/src/types/transaction";
import {
  formatDateHeader,
  groupTransactionsByDate,
} from "@/src/lib/utils/transactions";
import { useTransactions } from "@/src/hooks/use-transactions";
import { Skeleton } from "../ui/skeleton";

interface TransactionGroupProps {
  date: Date;
  transactions: Transaction[];
}

export const TransactionList = React.memo(function TransactionList() {
  const {
    data: transactionsResponse,
    isLoading,
    isFetching,
  } = useTransactions();

  if (isLoading || isFetching) {
    return <LoadingState />;
  }

  const transactions = transactionsResponse?.data ?? [];
  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <div className="animate-in fade-in-50 duration-500 space-y-3">
      {groupedTransactions.length > 0 ? (
        groupedTransactions.map((group) => (
          <TransactionGroup key={group.date.toISOString()} {...group} />
        ))
      ) : (
        <EmptyState />
      )}
    </div>
  );
});

const EmptyState = React.memo(() => (
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

const LoadingState = React.memo(() => (
  <div className="space-y-3">
    {[...Array(2)].map((_, groupIndex) => (
      <section key={groupIndex} className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
        <Card className="overflow-hidden">
          {[...Array(3)].map((_, itemIndex) => (
            <div
              key={itemIndex}
              className="flex items-center justify-between p-4 border-b last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </Card>
      </section>
    ))}
  </div>
));

const TransactionGroup = React.memo(
  ({ date, transactions }: TransactionGroupProps) => {
    const dailyBalance = transactions.reduce((acc, transaction) => {
      return (
        acc +
        (transaction.category?.type === "income"
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

TransactionList.displayName = "TransactionList";
TransactionGroup.displayName = "TransactionGroup";
EmptyState.displayName = "EmptyState";
LoadingState.displayName = "LoadingState";
