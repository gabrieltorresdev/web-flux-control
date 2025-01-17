import { TransactionList } from "@/features/transactions/components/transaction-list";
import { TransactionSummary } from "@/features/transactions/components/transaction-summary";
import { TransactionFilters } from "@/features/transactions/components/transaction-filters";
import { Suspense } from "react";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { MonthFilter } from "@/features/transactions/components/month-filter";
import { TransactionFilters as TransactionFiltersType } from "@/features/transactions/types";
import {
  getTransactionsList,
  getTransactionsSummary,
} from "@/features/transactions/actions/transactions";
import { getCategoryById } from "@/features/categories/actions/categories";
import { AnimatedPage } from "@/shared/components/layout/animated-page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HomePageProps {
  searchParams: Promise<Partial<TransactionFiltersType>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
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
    <AnimatedPage className="max-w-4xl mx-auto p-3 overflow-y-auto">
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
        <div className="flex flex-col gap-3">
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
    </AnimatedPage>
  );
}
