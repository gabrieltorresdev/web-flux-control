"use client";

import React, { useCallback, useRef, memo } from "react";
import { Calendar, Plus } from "lucide-react";
import type { Transaction } from "../../types/transaction";
import { TransactionItem } from "./transaction-item";
import { TransactionSkeleton } from "./transaction-skeleton";
import { Button } from "../ui/button";

type GroupedTransactions = {
  [key: string]: Transaction[];
};

type TransactionListProps = {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onAddTransaction: (date: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
  isLoadingMore: boolean;
};

function TransactionListComponent({
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  onAddTransaction,
  hasMore,
  onLoadMore,
  isLoading,
  isLoadingMore,
}: TransactionListProps) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, onLoadMore, isLoadingMore]
  );

  const groupedTransactions = React.useMemo(() => {
    return transactions.reduce((groups: GroupedTransactions, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(transaction);
      return groups;
    }, {});
  }, [transactions]);

  if (isLoading && transactions.length === 0) {
    return (
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 5 }).map((_, index) => (
          <TransactionSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma transação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {Object.entries(groupedTransactions).map(
        ([date, transactions], groupIndex, groupArray) => (
          <div key={date} className="space-y-1">
            <div className="bg-gray-50 border border-border z-[5] flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <h2 className="text-sm font-medium text-gray-500">{date}</h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const [day, month, year] = date
                    .split(" de ")
                    .map((part, index) => {
                      if (index === 1) {
                        const months = {
                          janeiro: "01",
                          fevereiro: "02",
                          março: "03",
                          abril: "04",
                          maio: "05",
                          junho: "06",
                          julho: "07",
                          agosto: "08",
                          setembro: "09",
                          outubro: "10",
                          novembro: "11",
                          dezembro: "12",
                        };
                        return months[part as keyof typeof months];
                      }
                      return part;
                    });
                  onAddTransaction(`${year}-${month}-${day.padStart(2, "0")}`);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
            <div className="divide-y divide-gray-100">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  ref={
                    groupIndex === groupArray.length - 1 &&
                    index === transactions.length - 1
                      ? lastElementRef
                      : null
                  }
                >
                  <TransactionItem
                    transaction={transaction}
                    onDelete={onDeleteTransaction}
                    onEdit={onEditTransaction}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {isLoadingMore && (
        <div className="py-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <TransactionSkeleton key={index} />
          ))}
        </div>
      )}

      {!hasMore && transactions.length > 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500">Não há mais transações para carregar.</p>
        </div>
      )}
    </div>
  );
}

export const TransactionList = memo(TransactionListComponent);