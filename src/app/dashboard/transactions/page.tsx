"use client";

import { useState } from "react";
import { DashboardTransactionsListItem } from "@/components/dashboard/transactions/list-item";
import { AddTransactionDialog } from "@/components/dashboard/transactions/add-transaction-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Search } from "lucide-react";

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
  }[];
};

export default function Transactions() {
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
          },
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
    <div className="flex flex-col p-4 md:p-12 gap-4 flex-1 overflow-hidden">
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-12 lg:col-span-6 2xl:col-span-4 flex flex-col gap-4 overflow-hidden min-h-0">
          <Card className="min-w-0 flex flex-col shadow-none">
            <CardContent className="pt-6 flex justify-between items-center">
              <div className="relative flex items-center flex-1 mr-4">
                <Search className="pointer-events-none w-4 h-4 absolute top-1/2 transform -translate-y-1/2 left-3 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <AddTransactionDialog onAddTransaction={handleAddTransaction} />
            </CardContent>
          </Card>

          <Card className="flex flex-col min-h-0 overflow-hidden shadow-none flex-1">
            <CardHeader>
              <CardTitle>Últimas transações</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 overflow-y-auto snap-y gap-4">
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
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 lg:col-span-6 2xl:col-span-8"></div>
      </div>
    </div>
  );
}
