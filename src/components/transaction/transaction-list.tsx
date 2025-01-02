"use client";

import { CircleDollarSign, Loader2 } from "lucide-react";
import { Card } from "../ui/card";
import { TransactionItem } from "./transaction-item";
import { cn, formatNumberToBRL } from "@/lib/utils";
import {
  formatDateHeader,
  groupTransactionsByDate,
} from "@/lib/utils/transactions";
import { useInView } from "react-intersection-observer";
import {
  useCallback,
  useTransition,
  cache,
  useState,
  useEffect,
  memo,
  useMemo,
} from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { getTransactionsList } from "@/app/actions/transactions";
import { Transaction } from "@/types/transaction";

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
  initialData: Awaited<ReturnType<typeof getTransactionsList>>;
  searchParams: SearchParams;
}

const ITEMS_PER_PAGE = 10;

// Calculate total for a group of transactions
const calculateGroupTotal = (transactions: Transaction[]) => {
  return transactions.reduce((acc, t) => {
    return t.category.type === "income" ? acc + t.amount : acc - t.amount;
  }, 0);
};

// Cache the fetch function to avoid unnecessary refetches
const fetchTransactionsPage = cache(
  async (params: SearchParams, page: number) => {
    try {
      return await getTransactionsList({
        month: params.month ? parseInt(params.month) : undefined,
        year: params.year ? parseInt(params.year) : undefined,
        categoryId: params.categoryId || undefined,
        search: params.search || undefined,
        page,
        perPage: ITEMS_PER_PAGE,
      });
    } catch (error) {
      console.error("Error fetching next page:", error);
      throw error;
    }
  }
);

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
});

const TransactionListContent = memo(function TransactionListContent({
  initialData,
  searchParams,
}: TransactionListProps) {
  const { ref: loadMoreRef, inView } = useInView();
  const [isPending, startTransition] = useTransition();

  // State for pagination
  const [pages, setPages] = useState<Transaction[][]>([
    initialData.transactions.data,
  ]);
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized fetch function for next pages
  const fetchNextPage = useCallback(async () => {
    if (!initialData.nextPage) return;

    startTransition(async () => {
      try {
        const nextPageData = await fetchTransactionsPage(
          searchParams,
          currentPage + 1
        );
        setPages((prev) => [...prev, nextPageData.transactions.data]);
        setCurrentPage((prev) => prev + 1);
      } catch (error) {
        console.error("Error fetching next page:", error);
      }
    });
  }, [searchParams, currentPage, initialData.nextPage]);

  // Handle infinite scroll
  useEffect(() => {
    if (inView && initialData.nextPage && !isPending) {
      fetchNextPage();
    }
  }, [inView, initialData.nextPage, isPending, fetchNextPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setPages([initialData.transactions.data]);
    setCurrentPage(1);
  }, [
    searchParams.month,
    searchParams.year,
    searchParams.categoryId,
    searchParams.search,
    initialData.transactions.data,
  ]);

  // Memoize expensive calculations
  const { transactions, groupedTransactionsWithTotals } = useMemo(() => {
    const allTransactions = pages.flat();
    const grouped = groupTransactionsByDate(allTransactions);
    const withTotals = grouped.map((group) => ({
      ...group,
      total: calculateGroupTotal(group.transactions),
    }));
    return {
      transactions: allTransactions,
      groupedTransactionsWithTotals: withTotals,
    };
  }, [pages]);

  if (transactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="animate-in fade-in-50 duration-500 space-y-3">
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
          className="flex justify-center py-3"
          role="status"
          aria-label="Carregando mais transações"
        >
          {isPending && (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
});

export function TransactionList({
  initialData,
  searchParams,
}: TransactionListProps) {
  return (
    <TransactionListContent
      initialData={initialData}
      searchParams={searchParams}
    />
  );
}
