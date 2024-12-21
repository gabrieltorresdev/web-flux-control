import { NewTransactionDialog } from "@/src/components/transaction/new-transaction/new-transaction-dialog";
import { TransactionList } from "@/src/components/transaction/transaction-list";
import { TransactionSummary } from "@/src/components/transaction/transaction-summary";

export default function Home() {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">
      <div>
        <h1 className="text-3xl font-bold">Transações</h1>
        <p className="text-muted-foreground">
          Gerencie suas transações financeiras
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <TransactionSummary />
        <NewTransactionDialog />
        <TransactionList />
      </div>
    </div>
  );
}
