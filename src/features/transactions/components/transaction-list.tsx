"use client";

import { CircleDollarSign, Loader2 } from "lucide-react";
import { TransactionItem } from "./transaction-item";
import { cn, formatNumberToBRL } from "@/shared/utils";
import { formatDateHeader } from "@/features/transactions/utils/transactions";
import { useInView } from "react-intersection-observer";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Transaction } from "@/features/transactions/types";
import { getTransactionsList } from "@/features/transactions/actions/transactions";

interface TransactionGroupProps {
  date: Date;
  transactions: Transaction[];
  total: number;
}

interface SearchParams {
  month: string | null;
  year: string | null;
  categoryId: string | null;
  search: string | null;
  type: string | null;
}

interface TransactionListProps {
  initialData: {
    transactions: {
      data: Transaction[];
    };
    nextPage: number | undefined;
  };
  searchParams: SearchParams;
}

// Calculate total for a group of transactions
const calculateGroupTotal = (transactions: Transaction[]) => {
  return transactions.reduce((acc, t) => {
    return t.category.type === "income" ? acc + t.amount : acc - t.amount;
  }, 0);
};

const EmptyState = memo(function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center h-48 space-y-4 animate-in fade-in-50"
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
  );
});

export const TransactionGroup = memo(function TransactionGroup({
  date,
  transactions,
  total,
}: TransactionGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-1 opacity-60">
        <time
          dateTime={date.toISOString()}
          className="text-xs font-medium"
        >
          {formatDateHeader(date)}
        </time>
        <p
          className={cn(
            "text-xs font-medium"
          )}
        >
          {total > 0
            ? `+${formatNumberToBRL(total)}`
            : formatNumberToBRL(total)}
        </p>
      </div>
      <div className="-mx-4">
        {transactions.map((transaction) => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction}
          />
        ))}
      </div>
    </div>
  );
});

export const TransactionList = function TransactionList({ 
  initialData, 
  searchParams,
}: TransactionListProps) {
  const { ref: loadMoreRef } = useInView({
    threshold: 0.1,
    rootMargin: "150px",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getTransactionsList({
        month: searchParams.month ? parseInt(searchParams.month) : undefined,
        year: searchParams.year ? parseInt(searchParams.year) : undefined,
        categoryId: searchParams.categoryId || undefined,
        search: searchParams.search || undefined,
        type: (searchParams.type as 'income' | 'expense' | undefined) || undefined,
        perPage: 10,
      });
      setData(response);
    };

    fetchData();
  }, [searchParams]);

  const groupedTransactionsWithTotals = useMemo(() => {
    const groups = data.transactions.data.reduce(
      (acc: TransactionGroupProps[], transaction) => {
        const date = new Date(transaction.dateTime);
        const existingGroup = acc.find(
          (group) =>
            formatDateHeader(new Date(group.date)) === formatDateHeader(date)
        );

        if (existingGroup) {
          existingGroup.transactions.push(transaction);
          existingGroup.total = calculateGroupTotal(existingGroup.transactions);
        } else {
          acc.push({
            date,
            transactions: [transaction],
            total: calculateGroupTotal([transaction]),
          });
        }

        return acc;
      },
      []
    );

    return groups.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [data.transactions.data]);

  if (!groupedTransactionsWithTotals.length) {
    return <EmptyState />;
  }

  return (
    <div ref={containerRef} className="transition-all duration-300">
      {data.transactions.data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {groupedTransactionsWithTotals.map((group) => (
            <TransactionGroup
              key={group.date.toISOString()}
              date={group.date}
              transactions={group.transactions}
              total={group.total}
            />
          ))}
          
          {/* Loading state at bottom of list */}
          {data.nextPage && (
            <div
              ref={loadMoreRef}
              className="flex justify-center py-4"
              aria-live="polite"
            >
              <div className="flex items-center space-x-2 text-muted-foreground/70">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Carregando mais...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
