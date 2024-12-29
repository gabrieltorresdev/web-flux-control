"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { memo, useCallback, useMemo } from "react";
import { Transaction } from "@/src/types/transaction";
import { format } from "date-fns";
import { formatNumberToBRL } from "@/src/lib/utils";
import { TransactionActions } from "./transaction-actions";
import { useDeleteTransaction } from "@/src/hooks/use-transactions";
import { useToast } from "@/src/hooks/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { CategoryIcon } from "../category/category-icon";

interface TransactionItemProps {
  transaction: Transaction;
}

interface TransactionContentProps {
  transaction: Transaction;
  isMobile: boolean;
  handleDelete: () => Promise<void>;
}

export const TransactionItem = memo(({ transaction }: TransactionItemProps) => {
  const deleteTransaction = useDeleteTransaction();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleDelete = useCallback(async () => {
    try {
      await deleteTransaction.mutateAsync(transaction.id);
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a transação.",
        variant: "destructive",
      });
    }
  }, [deleteTransaction, toast, transaction.id]);

  if (isMobile) {
    return (
      <Drawer>
        <DrawerHeader className="hidden">
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <DrawerTrigger asChild>
          <div className="group transition-all duration-200 active:bg-muted/50 p-3 touch-manipulation">
            <TransactionContent
              transaction={transaction}
              isMobile={isMobile}
              handleDelete={handleDelete}
            />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <TransactionActions
            transaction={transaction}
            onDelete={handleDelete}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="group transition-all duration-200 hover:bg-muted/50 p-3">
      <TransactionContent
        transaction={transaction}
        isMobile={isMobile}
        handleDelete={handleDelete}
      />
    </div>
  );
});

const TransactionContent = memo(
  ({ transaction, isMobile, handleDelete }: TransactionContentProps) => {
    const isIncome = useMemo(
      () => transaction.category?.type === "income",
      [transaction.category?.type]
    );

    const formattedAmount = useMemo(
      () => formatNumberToBRL(Math.abs(transaction.amount)),
      [transaction.amount]
    );

    const formattedTime = useMemo(
      () => format(new Date(transaction.dateTime), "HH:mm"),
      [transaction.dateTime]
    );

    return (
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0",
            isIncome ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}
          aria-hidden="true"
        >
          {transaction.category ? (
            <CategoryIcon
              icon={transaction.category.icon}
              isIncome={isIncome}
              className="h-4 w-4"
            />
          ) : isIncome ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate text-sm">
            {transaction.title}
          </h3>
          <span className="text-xs text-muted-foreground truncate">
            {transaction.category?.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col justify-center items-end">
            <p
              className={cn(
                "text-sm font-medium tabular-nums transition-colors whitespace-nowrap",
                isIncome ? "text-green-600" : "text-red-600"
              )}
            >
              {isIncome ? "+" : "-"}
              {formattedAmount}
            </p>
            <time
              dateTime={new Date(transaction.dateTime).toISOString()}
              className="text-xs text-muted-foreground"
            >
              {formattedTime}
            </time>
          </div>
          {!isMobile && (
            <div>
              <TransactionActions
                transaction={transaction}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

TransactionItem.displayName = "TransactionItem";
TransactionContent.displayName = "TransactionContent";
