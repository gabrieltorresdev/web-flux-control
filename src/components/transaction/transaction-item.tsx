"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { memo } from "react";
import { Transaction } from "@/src/types/transaction";
import { format } from "date-fns";
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

  const handleDelete = async () => {
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
  };

  if (isMobile) {
    return (
      <Drawer>
        <DrawerHeader className="hidden">
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <DrawerTrigger asChild>
          <div className="group transition-all duration-200 active:bg-gray-50 p-3 touch-manipulation">
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
    <div className="group transition-all duration-200 hover:bg-gray-50 p-3">
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
    const isIncome = transaction.category?.type === "income";

    return (
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
            isIncome ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}
          aria-hidden="true"
        >
          {isIncome ? (
            <ArrowUpRight className="h-5 w-5" />
          ) : (
            <ArrowDownRight className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 line-clamp-1 break-all">
            {transaction.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {transaction.category?.name}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p
            className={cn(
              "font-medium text-base tabular-nums transition-colors",
              isIncome ? "text-green-600" : "text-red-600"
            )}
          >
            {isIncome ? "+" : "-"}R$ {Math.abs(transaction.amount).toFixed(2)}
          </p>
          <time
            dateTime={new Date(transaction.dateTime).toISOString()}
            className="text-xs text-muted-foreground"
          >
            {format(new Date(transaction.dateTime), "HH:mm")}
          </time>
        </div>
        {!isMobile && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <TransactionActions
              transaction={transaction}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    );
  }
);

TransactionItem.displayName = "TransactionItem";
TransactionContent.displayName = "TransactionContent";
