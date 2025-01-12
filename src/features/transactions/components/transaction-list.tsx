"use client";

import { CircleDollarSign, Loader2 } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { TransactionItem } from "./transaction-item";
import { cn, formatNumberToBRL } from "@/shared/utils";
import { formatDateHeader } from "@/features/transactions/utils/transactions";
import { useInView } from "react-intersection-observer";
import { memo, useMemo, useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Transaction } from "@/features/transactions/types";
import { useIsMobile } from "@/shared/hooks/use-mobile";

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

const TransactionGroup = memo(function TransactionGroup({
  date,
  transactions,
  total,
}: TransactionGroupProps) {
  const isMobile = useIsMobile();

  return (
    <Accordion type="single" collapsible defaultValue="transactions">
      <AccordionItem
        value="transactions"
        className="border-none rounded-lg overflow-hidden"
      >
        <AccordionTrigger
          className={cn(
            "py-3 px-4 text-sm transition-colors",
            "hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/50 border",
            "flex items-center gap-2 justify-between bg-background rounded-lg data-[state=open]:rounded-b-none",
            isMobile && "sticky top-0 z-10 backdrop-blur-lg bg-opacity-90"
          )}
        >
          <div className="flex items-center justify-between flex-1">
            <time
              dateTime={date.toISOString()}
              className={cn("text-sm font-medium", isMobile && "text-base")}
            >
              {formatDateHeader(date)}
            </time>
            <p
              className={cn(
                "text-sm font-medium",
                total > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
                isMobile && "text-base"
              )}
            >
              {total > 0
                ? `+${formatNumberToBRL(total)}`
                : formatNumberToBRL(total)}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0 rounded-b-lg">
          <Card
            className={cn(
              "divide-y divide-border/50 shadow-none border-x border-b overflow-hidden rounded-b-lg",
              isMobile && "bg-background"
            )}
          >
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});

export function TransactionList({ initialData }: TransactionListProps) {
  const { ref: loadMoreRef } = useInView({
    threshold: 0.1,
    rootMargin: "150px",
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const groupedTransactionsWithTotals = useMemo(() => {
    const groups = initialData.transactions.data.reduce(
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
  }, [initialData.transactions.data]);

  if (!groupedTransactionsWithTotals.length) {
    return <EmptyState />;
  }

  return (
    <div ref={containerRef} className="space-y-4 pb-24">
      {groupedTransactionsWithTotals.map((group) => (
        <TransactionGroup
          key={group.date.toISOString()}
          date={group.date}
          transactions={group.transactions}
          total={group.total}
        />
      ))}
      {initialData.nextPage && (
        <div
          ref={loadMoreRef}
          className="flex justify-center py-4"
          aria-hidden="true"
        >
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
