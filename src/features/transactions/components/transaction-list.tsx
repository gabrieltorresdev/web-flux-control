"use client";

import { CircleDollarSign, Loader2 } from "lucide-react";
import { TransactionItem } from "./transaction-item";
import { cn, formatNumberToBRL } from "@/shared/utils";
import { formatDateHeader } from "@/features/transactions/utils/transactions";
import { useInView } from "react-intersection-observer";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Transaction } from "@/features/transactions/types";
import { getTransactionsList } from "@/features/transactions/actions/transactions";
import { TransactionActionsToolbar } from "./transaction-actions-toolbar";

interface TransactionGroupProps {
  date: Date;
  transactions: Transaction[];
  total: number;
  selectedTransactions: string[];
  isSelectionMode: boolean;
  onToggleSelect: (id: string) => void;
  animateMultiSelect: boolean;
}

interface SearchParams {
  month: string | null;
  year: string | null;
  categoryId: string | null;
  search: string | null;
}

interface TransactionListProps {
  initialData: {
    transactions: {
      data: Transaction[];
    };
    nextPage: number | undefined;
  };
  searchParams: SearchParams;
  onSelectionModeChange?: (isSelectionMode: boolean) => void;
  isSelectionMode?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  onSelectAll?: boolean;
}

// Calculate total for a group of transactions
const calculateGroupTotal = (transactions: Transaction[]) => {
  return transactions.reduce((acc, t) => {
    return t.category.type === "income" ? acc + t.amount : acc - t.amount;
  }, 0);
};

const EmptyState = memo(function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center h-48 space-y-4 animate-in fade-in-50"
      role="status"
    >
      <CircleDollarSign
        className="h-12 w-12 text-muted-foreground/50"
        aria-hidden="true"
      />
      <p className="text-muted-foreground text-center">
        Nenhuma transação encontrada
      </p>
    </div>
  );
});

const TransactionGroup = memo(function TransactionGroup({
  date,
  transactions,
  total,
  selectedTransactions,
  isSelectionMode,
  onToggleSelect,
  animateMultiSelect,
}: TransactionGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-1 opacity-60">
        <time
          dateTime={date.toISOString()}
          className="text-xs font-medium"
        >
          {formatDateHeader(date)}
        </time>
        <p
          className={cn(
            "text-xs font-medium"
          )}
        >
          {total > 0
            ? `+${formatNumberToBRL(total)}`
            : formatNumberToBRL(total)}
        </p>
      </div>
      <div className="divide-y divide-border/40 overflow-hidden">
        {transactions.map((transaction) => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction} 
            isSelected={selectedTransactions.includes(transaction.id)}
            isSelectionMode={isSelectionMode}
            onToggleSelect={onToggleSelect}
            animateMultiSelect={animateMultiSelect}
          />
        ))}
      </div>
    </div>
  );
});

// Add a function to enable selection mode that can be called from outside
export function useTransactionSelection() {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  const enableSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);
  
  const disableSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
  }, []);
  
  return {
    isSelectionMode,
    enableSelectionMode,
    disableSelectionMode,
    setIsSelectionMode
  };
}

// Remove the ref implementation since we're using the hook approach
export const TransactionList = function TransactionList({ 
  initialData, 
  searchParams,
  onSelectionModeChange,
  isSelectionMode: externalSelectionMode,
  onSelectionChange,
  onSelectAll
}: TransactionListProps) {
  const { ref: loadMoreRef } = useInView({
    threshold: 0.1,
    rootMargin: "150px",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(initialData);
  const [internalSelectionMode, setInternalSelectionMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [animateMultiSelect, setAnimateMultiSelect] = useState(false);

  // Use external selection mode if provided, otherwise use internal state
  const isSelectionMode = externalSelectionMode !== undefined ? externalSelectionMode : internalSelectionMode;

  // When external selection mode changes, sync it with our internal state
  useEffect(() => {
    if (externalSelectionMode !== undefined && externalSelectionMode !== internalSelectionMode) {
      setInternalSelectionMode(externalSelectionMode);
    }
  }, [externalSelectionMode, internalSelectionMode]);

  // When search params change, clear selection
  useEffect(() => {
    setSelectedTransactions([]);
    if (externalSelectionMode === undefined) {
      setInternalSelectionMode(false);
    }
  }, [searchParams, externalSelectionMode]);

  useEffect(() => {
    if (onSelectionModeChange) {
      onSelectionModeChange(isSelectionMode);
    }
  }, [isSelectionMode, onSelectionModeChange]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getTransactionsList({
        month: searchParams.month ? parseInt(searchParams.month) : undefined,
        year: searchParams.year ? parseInt(searchParams.year) : undefined,
        categoryId: searchParams.categoryId || undefined,
        search: searchParams.search || undefined,
        perPage: 10,
      });
      setData(response);
    };

    fetchData();
  }, [searchParams]);

  const groupedTransactionsWithTotals = useMemo(() => {
    const groups = data.transactions.data.reduce(
      (acc: TransactionGroupProps[], transaction) => {
        const date = new Date(transaction.dateTime);
        const existingGroup = acc.find(
          (group) =>
            formatDateHeader(new Date(group.date)) === formatDateHeader(date)
        );

        if (existingGroup) {
          existingGroup.transactions.push(transaction);
          existingGroup.total = calculateGroupTotal(existingGroup.transactions);
        } else {
          acc.push({
            date,
            transactions: [transaction],
            total: calculateGroupTotal([transaction]),
            selectedTransactions: [],
            isSelectionMode: false,
            onToggleSelect: () => {},
            animateMultiSelect: false,
          });
        }

        return acc;
      },
      []
    );

    return groups.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [data.transactions.data]);

  const handleToggleSelect = (id: string) => {
    setSelectedTransactions(prev => {
      if (prev.includes(id)) {
        return prev.filter(transactionId => transactionId !== id);
      } else {
        // If this is the second+ item being selected, trigger the multi-select animation
        if (prev.length >= 1) {
          setAnimateMultiSelect(true);
          setTimeout(() => setAnimateMultiSelect(false), 400);
        }
        return [...prev, id];
      }
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedTransactions.length === getAllTransactionIds().length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(getAllTransactionIds());
    }
  };

  const handleClearSelection = () => {
    setSelectedTransactions([]);
    if (externalSelectionMode === undefined) {
      setInternalSelectionMode(false);
    }
  };

  const handleEnableSelectionMode = useCallback(() => {
    if (externalSelectionMode === undefined) {
      setInternalSelectionMode(true);
    }
  }, [externalSelectionMode]);

  // Helper to get all transaction IDs
  const getAllTransactionIds = useCallback(() => {
    return data.transactions.data.map(transaction => transaction.id);
  }, [data.transactions.data]);

  // Is all selected
  const allSelected = selectedTransactions.length > 0 && 
    selectedTransactions.length === getAllTransactionIds().length;

  // Update parent component when selection changes
  useEffect(() => {
    // Only notify parent if onSelectionChange is provided
    if (onSelectionChange && Array.isArray(selectedTransactions)) {
      // Use requestAnimationFrame to debounce multiple updates in the same render cycle
      const timeoutId = setTimeout(() => {
        onSelectionChange(selectedTransactions);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedTransactions, onSelectionChange]);

  // Use a ref to track the previous value of onSelectAll to prevent circular updates
  const prevSelectAllRef = useRef(onSelectAll);
  
  // Handle select all from parent - prevent circular updates
  useEffect(() => {
    // Only process if the onSelectAll value actually changed
    if (onSelectAll !== undefined && onSelectAll !== prevSelectAllRef.current) {
      prevSelectAllRef.current = onSelectAll;
      const allIds = getAllTransactionIds();
      
      if (onSelectAll) {
        setSelectedTransactions(allIds);
      } else {
        setSelectedTransactions([]);
      }
    }
  }, [onSelectAll, getAllTransactionIds]);

  // Enhanced visual effect when entering/exiting selection mode
  const selectionModeClasses = useMemo(() => {
    return cn(
      "transition-all duration-300",
      isSelectionMode ? "opacity-100" : "opacity-100"
    );
  }, [isSelectionMode]);

  if (!groupedTransactionsWithTotals.length) {
    return <EmptyState />;
  }

  // Attach a double tap event for mobile to enter selection mode
  const handleTransactionLongPress = (id: string) => {
    if (!isSelectionMode) {
      setInternalSelectionMode(true);
    }
    handleToggleSelect(id);
  };

  // If we enter selection mode, listen for Escape key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSelectionMode) {
        handleClearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelectionMode]);

  return (
    <div ref={containerRef} className={selectionModeClasses}>
      {data.transactions.data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {groupedTransactionsWithTotals.map((group) => (
            <TransactionGroup
              key={group.date.toISOString()}
              date={group.date}
              transactions={group.transactions}
              total={group.total}
              selectedTransactions={selectedTransactions}
              isSelectionMode={isSelectionMode}
              onToggleSelect={handleToggleSelect}
              animateMultiSelect={animateMultiSelect}
            />
          ))}
          
          {/* Loading state at bottom of list */}
          {data.nextPage && (
            <div
              ref={loadMoreRef}
              className="flex justify-center py-4"
              aria-live="polite"
            >
              <div className="flex items-center space-x-2 text-muted-foreground/70">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Carregando mais...</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Selection mode floating indicator for empty selection */}
      {isSelectionMode && selectedTransactions.length === 0 && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm shadow-lg animate-in fade-in-50 slide-in-from-bottom-5 z-50">
          <p>Toque nos itens para selecionar</p>
        </div>
      )}
    </div>
  );
}
