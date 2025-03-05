import { TransactionList } from "@/features/transactions/components/transaction-list";
import { TransactionSummary } from "@/features/transactions/components/transaction-summary";
import { TransactionFilters } from "@/features/transactions/components/transaction-filters";
import { Suspense } from "react";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { MonthFilter } from "@/features/transactions/components/month-filter";
import { TransactionFilters as TransactionFiltersType } from "@/features/transactions/types";
import { NewTransactionButton } from "@/features/transactions/components/new-transaction-button";
import {
  getTransactionsList,
  getTransactionsSummary,
} from "@/features/transactions/actions/transactions";
import { getCategoryById } from "@/features/categories/actions/categories";
import { AnimatedPage } from "@/shared/components/layout/animated-page";
import { TransactionsContainer } from "@/features/transactions/components/transactions-container";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TransactionsPageProps {
  searchParams: Promise<Partial<TransactionFiltersType>>;
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const { month, year, categoryId, search } = await searchParams;

  // Fetch initial data on the server
  const [initialTransactions, initialSummary, initialCategoryResponse] =
    await Promise.all([
      getTransactionsList({
        month: month ? parseInt(month) : undefined,
        year: year ? parseInt(year) : undefined,
        perPage: 10,
      }),
      getTransactionsSummary({
        month: month ? parseInt(month) : undefined,
        year: year ? parseInt(year) : undefined,
      }),
      categoryId ? getCategoryById(categoryId) : null,
    ]);

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-3">
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between">
              <h1 className="text-muted-foreground text-sm font-medium">
                Minhas <strong className="text-primary">transações</strong>
              </h1>
              <MonthFilter initialMonth={month} initialYear={year} />
            </div>

            <TransactionFilters
              initialCategoryId={categoryId}
              initialCategory={initialCategoryResponse?.data}
              initialSearch={search}
            />
          </div>
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <TransactionsContainer 
            initialData={initialTransactions}
            initialSummary={initialSummary}
            searchParams={{
              month: month || null,
              year: year || null,
              categoryId: categoryId || null,
              search: search || null,
            }}
          />
        </Suspense>
      </div>
    </AnimatedPage>
  );
} 