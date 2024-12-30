"use client";

import { CircleDollarSign, Loader2 } from "lucide-react";
import { Card } from "../ui/card";
import { TransactionItem } from "./transaction-item";
import { cn, formatNumberToBRL } from "@/lib/utils";
import { Transaction } from "@/types/transaction";
import {
  formatDateHeader,
  groupTransactionsByDate,
} from "@/lib/utils/transactions";
import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "../ui/skeleton";
import { useInView } from "react-intersection-observer";
import { ErrorState } from "../ui/error-state";
import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

interface TransactionGroupProps {
  date: Date;
  transactions: Transaction[];
}

const ITEMS_PER_PAGE = 10;

function EmptyState() {
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
}

function LoadingState() {
  return (
    <div className="space-y-3 max-h-screen">
      {Array.from({ length: 2 }).map((_, index) => (
        <section key={index} className="space-y-3">
          <Accordion type="single" collapsible defaultValue="transactions">
            <AccordionItem
              value="transactions"
              className="border-none rounded-lg overflow-hidden"
            >
              <AccordionTrigger
                className={cn(
                  "py-3 px-3 text-sm transition-colors",
                  "hover:no-underline hover:bg-muted/50 data-[state=open]:!bg-muted border",
                  "flex items-center gap-2 justify-between !bg-card rounded-lg data-[state=open]:rounded-b-none"
                )}
              >
                <div className="flex items-center justify-between flex-1 gap-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0 rounded-b-lg">
                <Card className="divide-y divide-border/50 shadow-none border-none overflow-hidden rounded-none">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="p-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))}
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      ))}
    </div>
  );
}

function TransactionGroup({ date, transactions }: TransactionGroupProps) {
  const total = transactions.reduce((acc, t) => {
    return t.category.type === "income" ? acc + t.amount : acc - t.amount;
  }, 0);

  return (
    <Accordion type="single" collapsible defaultValue="transactions">
      <AccordionItem
        value="transactions"
        className="border-none rounded-lg overflow-hidden"
      >
        <AccordionTrigger
          className={cn(
            "py-3 px-3 text-sm transition-colors",
            "hover:no-underline hover:bg-muted/50  data-[state=open]:!bg-muted border",
            "flex items-center gap-2 justify-between !bg-card rounded-lg data-[state=open]:rounded-b-none"
          )}
        >
          <div className="flex items-center justify-between flex-1 gap-1.5">
            <time
              dateTime={date.toISOString()}
              className="text-xs font-medium text-muted-foreground"
            >
              {formatDateHeader(date)}
            </time>
            <p
              className={cn(
                "text-xs font-medium text-muted-foreground",
                total > 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {total > 0
                ? `+${formatNumberToBRL(total)}`
                : formatNumberToBRL(total)}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0 rounded-b-lg">
          <Card className="divide-y divide-border/50 shadow-none border-none overflow-hidden rounded-none">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function TransactionList() {
  const { ref: loadMoreRef, inView } = useInView();

  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError,
    refetch,
  } = useTransactions({ page: 1, perPage: ITEMS_PER_PAGE });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const transactions = data?.transactions?.data ?? [];
  const groupedTransactions = groupTransactionsByDate(transactions);

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar transações"
        description="Não foi possível carregar a lista de transações. Por favor, tente novamente."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading || (isFetching && !isFetchingNextPage)) {
    return <LoadingState />;
  }

  const hasTransactions = groupedTransactions.length > 0;

  return (
    <div className="animate-in fade-in-50 duration-500 space-y-3">
      {hasTransactions ? (
        <>
          {groupedTransactions.map((group) => (
            <TransactionGroup key={group.date.toISOString()} {...group} />
          ))}
          {hasNextPage && (
            <div
              ref={loadMoreRef}
              className="flex justify-center py-3"
              role="status"
              aria-label="Carregando mais transações"
            >
              {isFetchingNextPage && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
