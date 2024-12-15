import type { ApiTransaction } from "@/types/api";
import type { Transaction } from "@/types/transaction";

export function mapTransaction(apiTransaction: ApiTransaction): Transaction {
  return {
    id: apiTransaction.id,
    title: apiTransaction.title,
    amount: apiTransaction.amount,
    category: apiTransaction.category,
    date: apiTransaction.dateTime.split("T")[0],
    time: new Date(apiTransaction.dateTime).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}