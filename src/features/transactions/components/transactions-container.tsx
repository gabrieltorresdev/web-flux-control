"use client";

import { memo } from "react";
import { TransactionList } from "./transaction-list";
import { Transaction } from "@/features/transactions/types";
import { ApiTransactionSummaryResponse } from "@/features/transactions/types";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Card } from "@/shared/components/ui/card";

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
    type: string | null;
  };
}

export const TransactionsContainer = memo(function TransactionsContainer({
  initialData,
  searchParams
}: TransactionsContainerProps) {
  return (
    <div className="space-y-4 relative">
      <Card className="p-4"> 
        <TransactionList
          initialData={initialData}
          searchParams={searchParams}
        />  
      </Card>
    </div>
  );
});