"use client";

import { memo, useState, useTransition } from "react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { 
  Trash2, 
  X, 
  Tag, 
  CheckCircle, 
  Calendar, 
  FileEdit, 
  Filter, 
  Loader2,
  AlertCircle,
  CheckCheck,
  CreditCard,
  DollarSign,
  ArrowDownUp,
  CircleSlash
} from "lucide-react";
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
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/get-query-client";
import { useToast } from "@/shared/hooks/use-toast";
import { deleteTransaction } from "@/features/transactions/actions/transactions";
import { Separator } from "@/shared/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface TransactionActionsToolbarProps {
  selectedTransactions: string[];
  isSelectionMode: boolean;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  allSelected: boolean;
  totalTransactions: number;
}

export const TransactionActionsToolbar = memo(function TransactionActionsToolbar({
  selectedTransactions,
  isSelectionMode,
  onToggleSelectAll,
  onClearSelection,
  allSelected,
  totalTransactions,
}: TransactionActionsToolbarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const selectedCount = selectedTransactions.length;
  const hasSelection = selectedCount > 0;
  const isSingleSelection = selectedCount === 1;

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
        title: `${selectedCount === 1 ? 'Transação excluída' : 'Transações excluídas'}`,
        description: `${selectedCount === 1 ? 'A transação foi' : 'As transações foram'} excluída${selectedCount === 1 ? '' : 's'} com sucesso.`,
      });
      
      onClearSelection();
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

  const handleCategorize = () => {
    startTransition(() => {
      // This would be implemented to open a category selection dialog
      toast({
        title: "Categorizar transações",
        description: "Esta funcionalidade será implementada em breve.",
      });
    });
  };

  const handleEdit = () => {
    startTransition(() => {
      // This would be implemented to open an edit dialog for batch editing
      toast({
        title: "Editar transações",
        description: "Esta funcionalidade será implementada em breve.",
      });
    });
  };

  if (!isSelectionMode) return null;

  return (
    <>
      <div className={cn(
        "flex items-center justify-between bg-background/95 backdrop-blur-md",
        "border-b border-muted/40 py-3.5 px-4 mb-4 animate-in fade-in-50 slide-in-from-top-2",
        "sticky top-[64px] z-10 shadow-sm",
      )}>
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute -left-4 top-[40%] w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
          <div className="absolute right-0 bottom-0 w-40 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>
        
        {/* Selection controls */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 cursor-pointer",
                      "hover:scale-105 active:scale-95 transform",
                      allSelected && totalTransactions > 0
                        ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/10" 
                        : "border-muted-foreground/40 bg-background hover:border-primary/60 hover:shadow-sm"
                    )}
                    onClick={onToggleSelectAll}
                  >
                    {allSelected && totalTransactions > 0 ? (
                      <CheckCircle className="w-3.5 h-3.5 text-primary-foreground animate-checkmark" />
                    ) : selectedCount > 0 && selectedCount < totalTransactions ? (
                      <div className="w-2 h-2 bg-primary rounded-sm"></div>
                    ) : null}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {allSelected ? "Desmarcar todos" : "Selecionar todos"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex flex-col">
              <div className="flex items-center">
                {selectedCount > 0 ? (
                  <div 
                    className={cn(
                      "flex items-center text-sm font-medium cursor-pointer transition-colors",
                      "group-hover:text-primary hover:text-primary"
                    )}
                  >
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md mr-1.5 font-semibold min-w-[2rem] text-center">
                      {selectedCount}
                    </span>
                    <span>{isSingleSelection ? "item selecionado" : "itens selecionados"}</span>
                  </div>
                ) : (
                  <label 
                    className="text-sm font-medium cursor-pointer transition-colors hover:text-primary" 
                    onClick={onToggleSelectAll}
                  >
                    Selecionar todos
                  </label>
                )}
              </div>
              {selectedCount > 0 && (
                <span className="text-xs text-muted-foreground mt-0.5">
                  de {totalTransactions} transações disponíveis
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2.5 relative z-10">
          {/* Standard actions */}
          {selectedCount > 0 ? (
            <div className="flex items-center">
              <div className="flex items-center gap-1.5 mr-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={handleCategorize}
                        disabled={isPending}
                        className={cn(
                          "h-8 px-3 text-xs rounded-md shadow-sm transition-all",
                          "hover:shadow-md hover:scale-105 active:scale-95",
                          "bg-primary/5 hover:bg-primary/10 border border-primary/20",
                          "text-primary dark:text-primary-foreground"
                        )}
                      >
                        <Tag className="h-3.5 w-3.5 sm:mr-1.5" />
                        <span className="sm:inline hidden">Categorizar</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Categorizar transações selecionadas
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleEdit}
                        disabled={isPending}
                        className="h-8 px-3 text-xs rounded-md shadow-sm transition-all hover:shadow-md hover:scale-105 active:scale-95"
                      >
                        <FileEdit className="h-3.5 w-3.5 sm:mr-1.5" />
                        <span className="sm:inline hidden">Editar</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Editar transações selecionadas
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Divider */}
              <Separator orientation="vertical" className="h-7 mx-1" />
              
              {/* Cancel and Delete */}
              <div className="flex items-center gap-1.5 ml-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onClearSelection}
                        className={cn(
                          "h-8 px-3 text-xs rounded-md",
                          "border border-muted-foreground/20 hover:bg-background/80",
                          "hover:border-muted-foreground/40 transition-all"
                        )}
                      >
                        <X className="h-3.5 w-3.5 sm:mr-1.5" />
                        <span className="sm:inline hidden">Cancelar</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Cancelar seleção
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className={cn(
                          "h-8 px-3 text-xs rounded-md shadow-sm",
                          "hover:bg-destructive/90 transition-all",
                          "hover:scale-105 active:scale-95"
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:mr-1.5" />
                        <span className="sm:inline hidden">Excluir</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Excluir transações selecionadas
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic px-3 py-1.5 border border-dashed border-muted/60 rounded-md bg-muted/10">
              <AlertCircle className="w-3.5 h-3.5 inline-block mr-1.5 opacity-70" />
              Selecione itens para realizar ações
            </div>
          )}
        </div>
      </div>
      
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="max-w-[400px] rounded-xl border shadow-lg p-0 overflow-hidden">
          <div className="p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Excluir transações
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm mt-2">
                Tem certeza que deseja excluir {selectedCount} {isSingleSelection ? "transação" : "transações"}? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="bg-muted/30 p-4 flex items-center space-x-2 justify-end">
            <AlertDialogCancel className="rounded-md h-10 text-sm px-4 m-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 rounded-md h-10 text-sm px-4 transition-all hover:shadow-md"
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