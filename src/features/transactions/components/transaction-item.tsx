"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { memo, useCallback, useMemo, useState } from "react";
import { Transaction } from "@/features/transactions/types";
import { format } from "date-fns";
import { formatNumberToBRL } from "@/shared/utils";
import { TransactionActions } from "./transaction-actions";
import { useToast } from "@/shared/hooks/use-toast";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { CategoryIcon } from "@/features/categories/components/category-icon";
import { deleteTransaction } from "@/features/transactions/actions/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/get-query-client";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

interface TransactionItemProps {
  transaction: Transaction;
}

interface TransactionContentProps {
  transaction: Transaction;
  isMobile: boolean;
  handleDelete: () => Promise<void>;
}

export const TransactionItem = memo(({ transaction }: TransactionItemProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isPressed, setIsPressed] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const x = useMotionValue(0);

  // Transform x motion into opacity and scale for the action buttons
  const actionButtonsOpacity = useTransform(x, [-100, -20], [1, 0]);
  const scale = useTransform(x, [-100, -20], [1, 0.8]);

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true);
      await deleteTransaction(transaction.id);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      });
      // Reset swipe position after successful delete
      x.set(0);
      setIsDeleteDialogOpen(false);
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a transação.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [toast, transaction.id, queryClient, x]);

  if (isMobile) {
    return (
      <>
        <motion.div className="relative overflow-hidden">
          {/* Action buttons container */}
          <motion.div
            className="absolute right-0 h-full flex items-center gap-2 px-3 bg-background"
            style={{ opacity: actionButtonsOpacity }}
          >
            <motion.button
              className="p-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground"
              style={{ scale }}
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </motion.button>
            <motion.button
              className="p-2 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              style={{ scale }}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </motion.div>

          {/* Main content with drag */}
          <motion.div
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: -100, right: 0 }}
            dragElastic={0.1}
            dragMomentum={false}
            style={{ x }}
            className={cn(
              "group touch-manipulation bg-background",
              "active:bg-muted/50 transition-colors"
            )}
            onDragEnd={(
              _: MouseEvent | TouchEvent | PointerEvent,
              info: PanInfo
            ) => {
              // If dragged more than halfway, keep it open
              if (info.offset.x < -50) {
                x.set(-100);
              } else {
                x.set(0);
              }
            }}
          >
            <div
              className={cn(
                "p-3 touch-manipulation relative",
                isPressed && "bg-muted/30"
              )}
              onTouchStart={() => setIsPressed(true)}
              onTouchEnd={() => setIsPressed(false)}
              onTouchCancel={() => setIsPressed(false)}
            >
              <TransactionContent
                transaction={transaction}
                isMobile={isMobile}
                handleDelete={handleDelete}
              />
            </div>
          </motion.div>
        </motion.div>

        <EditTransactionDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          transaction={transaction}
        />

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta transação? Esta ação não
                pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
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
            "w-7 h-7 rounded-full flex items-center justify-center transition-colors shrink-0 border overflow-hidden",
            isIncome
              ? "bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400 border-green-500 dark:border-green-400"
              : "bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400 border-red-500 dark:border-red-400"
          )}
          aria-hidden="true"
        >
          {transaction.category ? (
            <CategoryIcon
              icon={transaction.category.icon}
              isIncome={isIncome}
            />
          ) : isIncome ? (
            <ArrowUpRight />
          ) : (
            <ArrowDownRight />
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
                isIncome
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
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
