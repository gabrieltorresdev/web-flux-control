import { NewTransactionDialog } from "@/src/components/transaction/new-transaction/new-transaction-dialog";
import { TransactionList } from "@/src/components/transaction/transaction-list";
import { TransactionSummary } from "@/src/components/transaction/transaction-summary";
import { MonthFilter } from "@/src/components/transaction/month-filter";
import { TransactionFilters } from "@/src/components/transaction/filters/transaction-filters";
import { type TransactionFilters as TransactionFiltersType } from "@/src/types/filters";

interface HomeProps {
  searchParams: Promise<Partial<TransactionFiltersType>>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { month, year, categoryId, search } = await searchParams;

  const initialDate = (() => {
    if (!month || !year) return new Date();

    const parsedMonth = parseInt(month as string);
    const parsedYear = parseInt(year as string);

    if (isNaN(parsedMonth) || isNaN(parsedYear)) return new Date();

    return new Date(parsedYear, parsedMonth - 1, 1);
  })();

  return (
    <section className="flex flex-col w-full h-full">
      <div>
        <div className="flex flex-col gap-2 max-w-3xl mx-auto w-full px-3">
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

      <div className="flex-1 pb-24 md:pb-10 pt-3">
        <div className="max-w-3xl mx-auto w-full space-y-3">
          <div className="px-3">
            <TransactionSummary />
          </div>
          <div className="px-3">
            <TransactionList />
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-30">
        <NewTransactionDialog initialDate={initialDate} />
      </div>
    </section>
  );
}
