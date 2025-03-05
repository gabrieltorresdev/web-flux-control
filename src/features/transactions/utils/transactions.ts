import { Transaction } from "@/features/transactions/types";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GroupedTransactions {
  date: Date;
  transactions: Transaction[];
}

function groupTransactionsByDate(
  transactions: Transaction[]
): GroupedTransactions[] {
  const groups = transactions.reduce((acc, transaction) => {
    const date = transaction.dateTime;

    // Aplicar fuso horario do cliente
    const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateInClientTimeZone = new Date(
      date.toLocaleString("en-US", { timeZone: clientTimeZone })
    );

    const dateKey = format(dateInClientTimeZone, "yyyy-MM-dd");

    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateInClientTimeZone,
        transactions: [],
      };
    }

    acc[dateKey].transactions.push(transaction);
    return acc;
  }, {} as Record<string, GroupedTransactions>);

  return Object.values(groups).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
}

export function formatDateHeader(date: Date): string {
  // Aplicar fuso horario do cliente
  const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateInClientTimeZone = new Date(
    date.toLocaleString("en-US", { timeZone: clientTimeZone })
  );

  if (isToday(dateInClientTimeZone)) {
    return "Hoje";
  }

  if (isYesterday(dateInClientTimeZone)) {
    return "Ontem";
  }

  return format(dateInClientTimeZone, "dd 'de' MMMM", { locale: ptBR });
}
