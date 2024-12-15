"use client";

import React, { memo } from "react";
import { Plus } from "lucide-react";
import type { Transaction } from "../../types/transaction";
import { TransactionItem } from "./transaction-item";
import { TransactionListSkeleton } from "./list/transaction-list-skeleton";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { formatDateForInput } from "@/lib/utils/date";
import { useToast } from "@/hooks/use-toast";

type GroupedTransactions = {
  [key: string]: Transaction[];
};

type TransactionListProps = {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onAddTransaction: (date: string) => void;
  hasMore: boolean;
  hasPrevious: boolean;
  onLoadMore: () => Promise<void>;
  onLoadPrevious: () => Promise<void>;
  isLoading: boolean;
  isLoadingMore: boolean;
  isLoadingPrevious: boolean;
  error: Error | null;
  onRetry: () => void;
};

function TransactionListComponent({
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  onAddTransaction,
  hasMore,
  hasPrevious,
  onLoadMore,
  onLoadPrevious,
  isLoading,
  isLoadingMore,
  isLoadingPrevious,
  error,
  onRetry,
}: TransactionListProps) {
  const { toast } = useToast();

  // Show error toast when error occurs
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar transações",
        description: "Tentando novamente em alguns segundos...",
        variant: "destructive",
      });

      const timer = setTimeout(() => {
        onRetry();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, onRetry, toast]);

  const groupedTransactions = React.useMemo(() => {
    const groups: GroupedTransactions = {};
    
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedTransactions.forEach(transaction => {
      const date = new Date(transaction.date).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      });

      if (!groups[date]) {
        groups[date] = [];
      }

      const exists = groups[date].some(t => t.id === transaction.id);
      if (!exists) {
        groups[date].push(transaction);
      }
    });

    return groups;
  }, [transactions]);

  if (isLoading && transactions.length === 0) {
    return <TransactionListSkeleton />;
  }

  if (transactions.length === 0) {
    return (
      <div className="p-6">
        <p className="text-center text-muted-foreground">
          Nenhuma transação encontrada.
        </p>
      </div>
    );
  }

  return (
    <div>
      {hasPrevious && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={onLoadPrevious}
            disabled={isLoadingPrevious}
            className="w-full sm:w-auto"
          >
            {isLoadingPrevious ? "Carregando..." : "Carregar anteriores"}
          </Button>
        </div>
      )}

      {Object.entries(groupedTransactions).map(([date, dateTransactions], groupIndex) => (
        <div
          key={`group-${date}`}
          className={cn(
            "border-t border-border pt-1.5",
            groupIndex === 0 && "border-none pt-0"
          )}
        >
          <div className="z-[5] flex items-center justify-between px-3 pb-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-medium opacity-40">{date}</h2>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onAddTransaction(formatDateForInput(date))}
              className="w-6 h-6 rounded-full"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div>
            {dateTransactions.map((transaction) => (
              <TransactionItem
                key={`${transaction.id}-${transaction.date}`}
                transaction={transaction}
                onDelete={onDeleteTransaction}
                onEdit={onEditTransaction}
              />
            ))}
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full sm:w-auto"
          >
            {isLoadingMore ? "Carregando..." : "Carregar mais"}
          </Button>
        </div>
      )}

      {!hasMore && transactions.length > 0 && (
        <div className="text-center">
          <p className="opacity-40 text-sm py-4">Fim</p>
        </div>
      )}
    </div>
  );
}

export const TransactionList = memo(TransactionListComponent);