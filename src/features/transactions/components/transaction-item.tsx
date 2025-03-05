"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  RefreshCcw,
  Calendar,
  Clock,
  Info
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import "../styles/animations.css";

// Extend the Transaction type from the imported type
interface ExtendedTransaction extends Transaction {
  isRecurring?: boolean;
  description?: string;
}

interface TransactionItemProps {
  transaction: ExtendedTransaction;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggleSelect?: (id: string) => void;
  animateMultiSelect?: boolean;
}

interface TransactionContentProps {
  transaction: ExtendedTransaction;
  isMobile: boolean;
  handleDelete: () => Promise<void>;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggleSelect?: (id: string) => void;
  animateMultiSelect?: boolean;
}

export const TransactionItem = memo(({
  transaction,
  isSelected = false,
  isSelectionMode = false,
  onToggleSelect = () => {},
  animateMultiSelect = false
}: TransactionItemProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isPressed, setIsPressed] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [animateSelect, setAnimateSelect] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
  }, [toast, transaction.id, queryClient]);

  const handleLongPress = useCallback(() => {
    if (onToggleSelect) {
      onToggleSelect(transaction.id);
    }
  }, [transaction.id, onToggleSelect]);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    const timer = setTimeout(() => {
      handleLongPress();
      // Add haptic feedback for mobile if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 400); // Slightly faster long press detection
    setLongPressTimer(timer);
  }, [handleLongPress]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  const handleClick = useCallback(() => {
    if (isSelectionMode && onToggleSelect) {
      setAnimateSelect(true);
      // Reset animation after it completes
      setTimeout(() => setAnimateSelect(false), 400);
      onToggleSelect(transaction.id);
    } else if (!isSelectionMode && !isMobile) {
      // Toggle expanded state on desktop when not in selection mode
      setIsExpanded(!isExpanded);
    }
  }, [isSelectionMode, onToggleSelect, transaction.id, isExpanded, isMobile]);

  if (isMobile) {
    return (
      <>
        <div 
          className={cn(
            "relative bg-background transition-all duration-150 border-b border-border/40 last:border-0",
            isSelected && "bg-primary/5",
            isSelected && animateSelect && "animate-select-highlight",
            isSelected && animateMultiSelect && "animate-multi-select"
          )}
          onClick={handleClick}
        >
          <div
            className={cn(
              "p-3 flex items-center touch-manipulation relative transition-all duration-150",
              isPressed && !isSelectionMode && "bg-muted/30",
              isSelectionMode && "pl-10", // Add left padding in selection mode
              isSelected && animateSelect && "bg-primary/10"
            )}
            onTouchStart={isSelectionMode ? undefined : handleTouchStart}
            onTouchEnd={isSelectionMode ? undefined : handleTouchEnd}
            onTouchCancel={isSelectionMode ? undefined : handleTouchEnd}
          >
            {isSelectionMode && (
              <div className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-200",
                "animate-in fade-in-0 slide-in-from-left-2",
                "animate-selection-mode-enter",
                isSelectionMode ? "opacity-100" : "opacity-0",
                animateSelect && "animate-checkbox"
              )}>
                <div 
                  className={cn(
                    "relative flex items-center justify-center",
                    "w-5 h-5 rounded-md border-2 transition-all duration-300",
                    isSelected 
                      ? "border-primary bg-primary text-primary-foreground shadow-sm" 
                      : "border-muted-foreground/30 bg-background hover:border-primary/50 hover:shadow"
                  )}
                >
                  {isSelected && (
                    <svg 
                      className={cn(
                        "w-3 h-3 text-primary-foreground transition-transform duration-300",
                        animateSelect && "animate-checkmark"
                      )} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2.5} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  )}
                </div>
              </div>
            )}

            <TransactionContent
              transaction={transaction}
              isMobile={isMobile}
              handleDelete={handleDelete}
              isSelected={isSelected}
              isSelectionMode={isSelectionMode}
              onToggleSelect={onToggleSelect}
              animateMultiSelect={animateMultiSelect}
            />
            
            {!isSelectionMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-2 p-1.5 rounded-full hover:bg-muted/70 active:bg-muted/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-sm border-muted/80">
                  <DropdownMenuItem 
                    className="cursor-pointer gap-2 text-sm font-medium"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Editar transação</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer gap-2 text-sm font-medium text-destructive focus:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir transação</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <EditTransactionDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          transaction={transaction}
        />

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent className="max-w-[350px] rounded-xl p-0 overflow-hidden">
            <div className="p-6">
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir transação</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  Excluir esta transação? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            <AlertDialogFooter className="bg-muted/30 p-3 flex items-center space-x-2 justify-end">
              <AlertDialogCancel className="rounded-full h-9 text-sm px-4 m-0">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90 rounded-full h-9 text-sm px-4"
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
    <>
      <div 
        className={cn(
          "group transition-all duration-150 hover:bg-muted/50 p-3 relative cursor-pointer border-b border-border/40 last:border-0",
          isSelected && "bg-primary/5",
          isSelected && animateSelect && "animate-select-highlight",
          isSelected && animateMultiSelect && "animate-multi-select",
          isExpanded && "bg-muted/30"
        )}
        onClick={handleClick}
      >
        {isSelectionMode && (
          <div className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-200",
            "animate-in fade-in-0 slide-in-from-left-2",
            "animate-selection-mode-enter",
            isSelectionMode ? "opacity-100" : "opacity-0",
            animateSelect && "animate-checkbox"
          )}>
            <div 
              className={cn(
                "relative flex items-center justify-center",
                "w-5 h-5 rounded-md border-2 transition-all duration-300",
                isSelected 
                  ? "border-primary bg-primary text-primary-foreground shadow-sm" 
                  : "border-muted-foreground/30 bg-background hover:border-primary/50 hover:shadow"
              )}
            >
              {isSelected && (
                <svg 
                  className={cn(
                    "w-3 h-3 text-primary-foreground transition-transform duration-300",
                    animateSelect && "animate-checkmark"
                  )} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              )}
            </div>
          </div>
        )}
        <div className={cn(
          "transition-all duration-200",
          isSelectionMode ? "pl-7" : "pl-0",
          isSelected && animateSelect && "bg-primary/10"
        )}>
          <TransactionContent
            transaction={transaction}
            isMobile={isMobile}
            handleDelete={handleDelete}
            isSelected={isSelected}
            isSelectionMode={isSelectionMode}
            onToggleSelect={onToggleSelect}
            animateMultiSelect={animateMultiSelect}
          />
        </div>
        
        {/* Expanded details section */}
        {isExpanded && !isSelectionMode && (
          <div className="mt-2 pl-10 text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-2 animate-in fade-in-0 slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(transaction.dateTime), "dd/MM/yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>{format(new Date(transaction.dateTime), "HH:mm")}</span>
            </div>
            {transaction.isRecurring && (
              <div className="flex items-center gap-2 col-span-2">
                <RefreshCcw className="h-3.5 w-3.5" />
                <span>Transação recorrente</span>
              </div>
            )}
            {transaction.description && (
              <div className="flex items-start gap-2 col-span-2">
                <Info className="h-3.5 w-3.5 mt-0.5" />
                <span>{transaction.description}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <EditTransactionDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        transaction={transaction}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="max-w-[400px] rounded-xl p-0 overflow-hidden">
          <div className="p-6">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transação</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Excluir esta transação? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="bg-muted/30 p-3 flex items-center space-x-2 justify-end">
            <AlertDialogCancel className="rounded-full h-9 text-sm px-4 m-0">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 rounded-full h-9 text-sm px-4"
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
});

const TransactionContent = memo(
  ({ transaction, isMobile, handleDelete, isSelected, isSelectionMode, animateMultiSelect }: TransactionContentProps) => {
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
    
    const isRecurring = transaction.isRecurring;

    return (
      <div className="flex items-center gap-3 w-full">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 border overflow-hidden",
            isIncome
              ? "bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400 border-green-500/40 dark:border-green-400/40"
              : "bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400 border-red-500/40 dark:border-red-400/40"
          )}
          aria-hidden="true"
        >
          {transaction.category ? (
            <CategoryIcon
              icon={transaction.category.icon}
              isIncome={isIncome}
              iconClassName="h-4 w-4"
            />
          ) : isIncome ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-medium text-foreground truncate text-sm">
              {transaction.title}
            </h3>
            {isRecurring && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <RefreshCcw className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Transação recorrente</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate">
            {transaction.category?.name || "Sem categoria"}
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
              className="text-xs text-muted-foreground whitespace-nowrap"
            >
              {formattedTime}
            </time>
          </div>
          {!isMobile && !isSelectionMode && (
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
