import { TransactionList } from "@/components/transaction/transaction-list";
import { TransactionSummary } from "@/components/transaction/transaction-summary";
import { TransactionFilters } from "@/components/transaction/filters/transaction-filters";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MonthFilter } from "@/components/transaction/month-filter";
import { TransactionFilters as TransactionFiltersType } from "@/types/filters";
import { NewTransactionButton } from "@/components/transaction/new-transaction/new-transaction-button";
import {
  getTransactionsList,
  getTransactionsSummary,
} from "@/app/actions/transactions";

interface HomePageProps {
  searchParams: Promise<Partial<TransactionFiltersType>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { month, year, categoryId, search } = await searchParams;

  // Fetch initial data on the server
  const [initialTransactions, initialSummary] = await Promise.all([
    getTransactionsList({
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      categoryId,
      search,
      page: 1,
      perPage: 10,
    }),
    getTransactionsSummary({
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      categoryId,
      search,
    }),
  ]);

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
        <Suspense fallback={<LoadingSpinner />}>
          <TransactionSummary initialSummary={initialSummary} />
          <TransactionList
            initialData={initialTransactions}
            searchParams={{
              month: month || null,
              year: year || null,
              categoryId: categoryId || null,
              search: search || null,
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
