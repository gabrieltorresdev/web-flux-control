"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { DashboardTransactionsListItem } from "@/components/dashboard/transactions/list-item";
import { useState } from "react";
import { AddTransactionDialog } from "@/components/dashboard/transactions/add-transaction-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type DayTransactions = {
  date: string;
  transactions: {
    description: string;
    time: string;
    amount: string;
    type: "income" | "expense";
    category: {
      name: string;
      color: string;
    };
    subcategory: string;
  }[];
};

export function DashboardOverviewRecentTransactions({}) {
  const [transactionsByDay, setTransactionsByDay] = useState<DayTransactions[]>(
    [
      {
        date: "2024-11-29",
        transactions: [
          {
            description: "Salário",
            time: "13:40",
            amount: "5000.00",
            type: "income",
            category: {
              name: "Receita",
              color: "hsl(120, 70%, 40%)",
            },
            subcategory: "Salário",
          },
          // ... (outros exemplos de transações)
        ],
      },
      {
        date: "2024-11-28",
        transactions: [
          {
            description: "Compra em Mercado Extra",
            time: "16:40",
            amount: "-467.49",
            type: "expense",
            category: {
              name: "Alimentação",
              color: "hsl(200, 80%, 50%)",
            },
            subcategory: "Supermercado",
          },
          {
            description: "Pagamento Aluguel",
            time: "12:20",
            amount: "-830.00",
            type: "expense",
            category: {
              name: "Moradia",
              color: "hsl(20, 60%, 45%)",
            },
            subcategory: "Aluguel",
          },
        ],
      },
    ]
  );

  const [searchTerm, setSearchTerm] = useState("");

  const handleAddTransaction = (newTransaction: {
    description: string;
    amount: string;
    type: "income" | "expense";
    category: {
      name: string;
      color: string;
    };
    subcategory: string;
  }) => {
    const today = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setTransactionsByDay((prevState) => {
      const todayGroup = prevState.find((group) => group.date === today);
      if (todayGroup) {
        return prevState.map((group) =>
          group.date === today
            ? {
                ...group,
                transactions: [
                  {
                    ...newTransaction,
                    time: currentTime,
                  },
                  ...group.transactions,
                ],
              }
            : group
        );
      } else {
        return [
          {
            date: today,
            transactions: [
              {
                ...newTransaction,
                time: currentTime,
              },
            ],
          },
          ...prevState,
        ];
      }
    });
  };

  const filteredTransactions = transactionsByDay
    .map((group) => ({
      ...group,
      transactions: group.transactions.filter((transaction) =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.transactions.length > 0);

  return (
    <div className="gap-4 w-full">
      <Card className="shadow-none flex-1">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-xl">Últimas transações</CardTitle>
              <CardDescription className="line-clamp-1">
                Foram feitas {transactionsByDay.length} transações no período
              </CardDescription>
            </div>
            <div className="w-full">
              <AddTransactionDialog onAddTransaction={handleAddTransaction} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="flex flex-col gap-4 snap-y h-[232px]">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((group) => (
                <div className="flex flex-col gap-4" key={group.date}>
                  <strong className="text-xs font-light opacity-70 tracking-wider">
                    {format(new Date(group.date), "dd/MM/yyyy")}
                  </strong>
                  <div className="flex flex-col w-full">
                    {group.transactions.map((item, index) => (
                      <DashboardTransactionsListItem
                        key={group.date + String(index)}
                        description={item.description}
                        time={item.time}
                        amount={item.amount}
                        category={item.category}
                        subcategory={item.subcategory}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-1 justify-center items-center opacity-40">
                Suas Transações recentes aparecerão aqui
              </div>
            )}
            <div className="grid grid-cols-9 items-center">
              <div className="border-t col-span-4"></div>
              <div className="text-center font-light text-sm opacity-50 col-span-1">
                FIM
              </div>
              <div className="border-t col-span-4"></div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
