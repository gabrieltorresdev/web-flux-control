import { TransactionList } from "@/components/transaction/transaction-list";
import { TransactionSummary } from "@/components/transaction/transaction-summary";
import { NewTransactionButton } from "@/components/transaction/new-transaction/new-transaction-button";
import { TransactionFilters } from "@/components/transaction/filters/transaction-filters";
import {
  prefetchTransactions,
  getDehydratedState,
} from "@/lib/ssr/prefetch-query";
import { HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MonthFilter } from "../components/transaction/month-filter";
import { TransactionFilters as TransactionFiltersType } from "@/types/filters";
interface HomePageProps {
  searchParams: Promise<Partial<TransactionFiltersType>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { month, year, categoryId, search } = await searchParams;
  const queryClient = await prefetchTransactions(
    month ? parseInt(month) : undefined,
    year ? parseInt(year) : undefined,
    categoryId,
    search
  );

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3 px-3">
      <div>
        <div className="flex flex-col gap-2 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-muted-foreground text-sm font-medium">
              Minhas <strong className="text-primary">transações</strong>
            </h1>
            <MonthFilter initialMonth={month} initialYear={year} />
          </div>

          <TransactionFilters
            initialCategoryId={categoryId}
            initialSearch={search}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <NewTransactionButton />
        <HydrationBoundary state={getDehydratedState(queryClient)}>
          <Suspense fallback={<LoadingSpinner />}>
            <TransactionSummary />
            <TransactionList />
          </Suspense>
        </HydrationBoundary>
      </div>
    </div>
  );
}
