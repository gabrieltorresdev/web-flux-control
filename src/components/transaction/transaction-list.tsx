"use client";

import { CircleDollarSign, Loader2 } from "lucide-react";
import { Card } from "../ui/card";
import { TransactionItem } from "./transaction-item";
import { cn, formatNumberToBRL } from "@/lib/utils";
import { formatDateHeader } from "@/lib/utils/transactions";
import { useInView } from "react-intersection-observer";
import { useTransition, memo, useMemo, useRef, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Transaction } from "@/types/transaction";
import { useIsMobile } from "@/hooks/use-mobile";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import {
  createTransactionStore,
  createTransactionSelectors,
} from "@/stores/transaction-store";

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

const ITEMS_PER_PAGE = 10;

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
            "py-3 px-3 text-sm transition-colors",
            "hover:no-underline hover:bg-muted/50 data-[state=open]:!bg-muted border",
            "flex items-center gap-2 justify-between !bg-card rounded-lg data-[state=open]:rounded-b-none",
            isMobile && "sticky top-0 z-10 backdrop-blur-lg bg-opacity-90"
          )}
        >
          <div className="flex items-center justify-between flex-1 gap-1.5">
            <time
              dateTime={date.toISOString()}
              className={cn(
                "text-xs font-medium text-muted-foreground",
                isMobile && "text-sm"
              )}
            >
              {formatDateHeader(date)}
            </time>
            <p
              className={cn(
                "text-xs font-medium",
                total > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
                isMobile && "text-sm font-semibold"
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
              "divide-y divide-border/50 shadow-none border-none overflow-hidden rounded-none",
              isMobile && "bg-transparent"
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

const ITEM_HEIGHT = 72; // Height of each transaction item in pixels
const LIST_HEIGHT = 600; // Maximum height of the virtualized list

interface RowData {
  date: Date;
  transactions: Transaction[];
  total: number;
}

const Row = memo(function Row({
  index,
  style,
  data,
}: ListChildComponentProps<RowData[]>) {
  const group = data[index];
  return (
    <div style={style}>
      <TransactionGroup
        date={group.date}
        transactions={group.transactions}
        total={group.total}
      />
    </div>
  );
});

const TransactionListContent = memo(function TransactionListContent({
  initialData,
  searchParams,
}: TransactionListProps) {
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "150px",
  });
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  // Create store instance with initial data
  const store = useMemo(
    () =>
      createTransactionStore({
        initialData: {
          transactions: initialData.transactions.data,
          hasNextPage: Boolean(initialData.nextPage),
        },
      }),
    [initialData.transactions.data, initialData.nextPage]
  );

  // Create selectors for this store instance
  const useInstanceSelectors = useMemo(
    () => createTransactionSelectors(store),
    [store]
  );

  // Use the store-specific selectors
  const {
    transactions,
    groupedTransactions,
    isLoading,
    hasNextPage,
    currentPage,
  } = useInstanceSelectors();

  const { fetchTransactions, setFilters } = store();

  const groupedTransactionsWithTotals = useMemo(() => {
    return groupedTransactions.map((group) => ({
      ...group,
      total: calculateGroupTotal(group.transactions),
    }));
  }, [groupedTransactions]);

  // Set filters when they change
  useEffect(() => {
    setFilters({
      month: searchParams.month ? parseInt(searchParams.month) : undefined,
      year: searchParams.year ? parseInt(searchParams.year) : undefined,
      categoryId: searchParams.categoryId || undefined,
      search: searchParams.search || undefined,
    });
  }, [
    searchParams.month,
    searchParams.year,
    searchParams.categoryId,
    searchParams.search,
    setFilters,
  ]);

  // Handle infinite scroll
  useEffect(() => {
    if (inView && hasNextPage && !isLoading && !isPending) {
      startTransition(() => {
        fetchTransactions(currentPage + 1, isMobile ? 5 : ITEMS_PER_PAGE);
      });
    }
  }, [
    inView,
    hasNextPage,
    isLoading,
    isPending,
    currentPage,
    isMobile,
    fetchTransactions,
  ]);

  if (transactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div ref={containerRef} className="space-y-4">
      <List
        height={LIST_HEIGHT}
        itemCount={groupedTransactionsWithTotals.length}
        itemSize={ITEM_HEIGHT}
        width="100%"
        itemData={groupedTransactionsWithTotals}
      >
        {Row}
      </List>
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="flex justify-center py-4"
          aria-hidden="true"
        >
          {(isPending || isLoading) && (
            <Loader2
              className="h-6 w-6 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </div>
  );
});

export function TransactionList(props: TransactionListProps) {
  return <TransactionListContent {...props} />;
}
