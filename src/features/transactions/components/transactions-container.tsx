"use client";

import { memo, useState, useCallback } from "react";
import { TransactionList, useTransactionSelection } from "./transaction-list";
import { TransactionSummary } from "./transaction-summary";
import { NewTransactionButton } from "./new-transaction-button";
import { Transaction } from "@/features/transactions/types";
import { ApiTransactionSummaryResponse } from "@/features/transactions/types";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/button";
import { CheckSquare, Trash2, X } from "lucide-react";
import { cn } from "@/shared/utils";
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
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/get-query-client";
import { useToast } from "@/shared/hooks/use-toast";
import { deleteTransaction } from "@/features/transactions/actions/transactions";

interface TransactionsContainerProps {
  initialData: {
    transactions: {
      data: Transaction[];
    };
    nextPage: number | undefined;
  };
  initialSummary: ApiTransactionSummaryResponse;
  searchParams: {
    month: string | null;
    year: string | null;
    categoryId: string | null;
    search: string | null;
  };
}

export const TransactionsContainer = memo(function TransactionsContainer({
  initialData,
  initialSummary,
  searchParams
}: TransactionsContainerProps) {
  const { isSelectionMode, enableSelectionMode, disableSelectionMode } = useTransactionSelection();
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  
  const handleToggleSelectAll = () => {
    // Use a functional state update to ensure we're using the latest state
    setAllSelected(prevAllSelected => {
      if (prevAllSelected) {
        // Deselect all items
        setSelectedTransactions([]);
        return false;
      } else {
        // Select all items
        const allIds = initialData.transactions.data.map(t => t.id);
        setSelectedTransactions(allIds);
        return true;
      }
    });
  };
  
  const handleClearSelection = () => {
    disableSelection();
  };
  
  const handleSelectionChange = (ids: string[]) => {
    // Update selected transactions
    setSelectedTransactions(ids);
    
    // Check if all items are selected
    const allIds = initialData.transactions.data.map(t => t.id);
    const isAllSelected = 
      ids.length === allIds.length && 
      ids.every(id => allIds.includes(id));
    
    // Only update allSelected if it has changed
    if (isAllSelected !== allSelected) {
      setAllSelected(isAllSelected);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      setIsDeleting(true);
      // Process deletions sequentially to prevent overwhelming the server
      for (const id of selectedTransactions) {
        await deleteTransaction(id);
      }
      
      await queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      
      toast({
        title: "Transações excluídas",
        description: "As transações selecionadas foram excluídas com sucesso.",
        duration: 3000,
      });
      
      handleClearSelection();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir as transações selecionadas.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Improved handlers for selection mode
  const enableSelection = useCallback(() => {
    enableSelectionMode();
    // Reset selection state when entering selection mode
    setSelectedTransactions([]);
    setAllSelected(false);
    setIsDismissing(false);
  }, [enableSelectionMode]);

  const disableSelection = useCallback(() => {
    setIsDismissing(true);
    // Add small delay for exit animation
    setTimeout(() => {
      disableSelectionMode();
      setSelectedTransactions([]);
      setAllSelected(false);
      setIsDismissing(false);
    }, 300);
  }, [disableSelectionMode]);

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className={cn(
          "flex items-center justify-between animate-in fade-in-0 duration-300",
          isDismissing && "animate-out fade-out-0 duration-300"
        )}>
          <div className="flex items-center">
            <span className={cn(
              "px-2 py-0.5 text-xs rounded-md font-medium scale-90 origin-left",
              "bg-muted text-muted-foreground transition-all duration-200"
            )}>
              {isSelectionMode 
                ? selectedTransactions.length > 0
                  ? `${selectedTransactions.length} ${selectedTransactions.length === 1 ? "item" : "itens"}`
                  : "Selecionar"
                : `${initialData.transactions.data.length} ${initialData.transactions.data.length === 1 ? "transação" : "transações"}`
              }
            </span>
          </div>
          
          <div className={cn(
            "ml-auto overflow-hidden relative transition-all duration-200",
            isSelectionMode ? "max-w-[300px] opacity-100" : "max-w-[100px] opacity-100"
          )}>
            {isSelectionMode ? (
              <div className={cn(
                "flex items-center gap-2 transition-all",
                "animate-in slide-in-from-right-5 duration-300",
                isDismissing ? "animate-out slide-out-to-right-5 duration-300" : ""
              )}>
                <div className="flex items-center gap-1.5">
                  <Checkbox 
                    id="select-all" 
                    checked={allSelected && initialData.transactions.data.length > 0} 
                    onCheckedChange={handleToggleSelectAll}
                    className="h-3.5 w-3.5"
                  />
                  <label 
                    htmlFor="select-all" 
                    className="text-xs font-medium cursor-pointer whitespace-nowrap"
                  >
                    {selectedTransactions.length === 0 
                      ? "Todos" 
                      : `${selectedTransactions.length} ${selectedTransactions.length === 1 ? "item" : "itens"}`}
                  </label>
                </div>
                
                <div className={cn(
                  "transition-all duration-200 flex items-center",
                  selectedTransactions.length > 0 
                    ? "max-w-[100px] opacity-100 ml-1" 
                    : "max-w-0 opacity-0 ml-0 pointer-events-none"
                )}>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="h-7 px-2 text-xs rounded-full"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="ml-1 sr-only sm:not-sr-only">Excluir</span>
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearSelection}
                  className="h-7 w-7 p-0 rounded-full"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Cancelar</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 gap-1.5 text-xs rounded-full hover:shadow-sm hover:bg-primary/5 transition-all"
                onClick={enableSelection}
              >
                <CheckSquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs font-normal">Selecionar</span>
              </Button>
            )}
          </div>
        </div>
        
        <TransactionList
          initialData={initialData}
          searchParams={searchParams}
          isSelectionMode={isSelectionMode}
          onSelectionChange={handleSelectionChange}
          onSelectAll={allSelected}
        />
      </div>
      
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="max-w-[350px] rounded-xl p-0 overflow-hidden">
          <div className="p-6">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transações</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Excluir {selectedTransactions.length} {selectedTransactions.length === 1 ? "transação" : "transações"}? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="bg-muted/30 p-3 flex items-center space-x-2 justify-end">
            <AlertDialogCancel className="rounded-full h-9 text-sm px-4 m-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
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
      
      <NewTransactionButton />
    </>
  );
}); 