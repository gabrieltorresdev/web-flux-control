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

  return (
    <section className="flex flex-col gap-3 w-full mx-auto max-w-3xl">
      {/* Cabeçalho com título e botão */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-muted-foreground text-xs md:text-sm font-medium">
          Minhas <strong className="text-primary">transações</strong>
        </h1>
        <div className="scale-90 md:scale-100 origin-right">
          <MonthFilter initialMonth={month} initialYear={year} />
        </div>
      </div>

      <TransactionFilters
        initialCategoryId={categoryId}
        initialSearch={search}
      />

      <div className="space-y-3">
        <TransactionSummary />
      </div>

      <div className="flex">
        <div>
          <NewTransactionDialog />
        </div>
      </div>

      {/* Conteúdo principal com scroll e largura máxima maior no desktop */}
      <div className="w-full max-w-5xl mx-auto">
        <TransactionList />
      </div>
    </section>
  );
}
