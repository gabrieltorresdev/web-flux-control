import React, { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

type TransactionAmountProps = {
  amount: number;
  type: "income" | "expense";
};

function TransactionAmountComponent({ amount, type }: TransactionAmountProps) {
  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(amount));
  }, [amount]);

  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        type === "income" ? "text-emerald-600" : "text-rose-600"
      )}
    >
      {type === "income" ? "+" : "-"}
      {formattedAmount}
    </span>
  );
}

export const TransactionAmount = memo(TransactionAmountComponent);
