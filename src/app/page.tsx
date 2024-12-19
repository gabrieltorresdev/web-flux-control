import { formatNumberToBRL } from "@/src/lib/utils";
import { TransactionService } from "@/src/services/transaction-service";
import { Transaction } from "@/src/types/transaction";

type GroupedTransactions = {
  date: Date;
  transactions: Transaction[];
};

export default async function Home() {
  const fetchTransactions = async () => {
    const { data: transactions } =
      await new TransactionService().findAllPaginated();

    return transactions;
  };

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: GroupedTransactions[] = [];

    if (!transactions) {
      return groups;
    }

    transactions.forEach((transaction) => {
      const date = transaction.dateTime;

      groups.push({
        date,
        transactions: [transaction],
      });
    });

    return groups;
  };

  const transactions = await fetchTransactions();
  const groupedTransactionsByDate = groupTransactionsByDate(transactions);

  return (
    <div>
      <div className="flex flex-col">
        <div className="flex flex-col gap-3">
          {groupedTransactionsByDate.map(({ date, transactions }) => {
            return (
              <div key={`transactions-${date}`} className="flex flex-col gap-3">
                <div>
                  <span className="text-xs">
                    {date.toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col gap-1.5">
                        <strong className="tracking-normal">
                          {transaction.title}
                        </strong>
                        <span className="text-sm">
                          {transaction.category.name}
                        </span>
                      </div>
                      <div>{formatNumberToBRL(transaction.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
