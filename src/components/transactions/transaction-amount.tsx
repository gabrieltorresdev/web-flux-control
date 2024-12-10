import React, { memo, useMemo } from "react";

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
      className={`font-medium ${
        type === "income" ? "text-green-600" : "text-red-600"
      }`}
    >
      {type === "income" ? "+" : "-"}
      {formattedAmount}
    </span>
  );
}

export const TransactionAmount = memo(TransactionAmountComponent);
