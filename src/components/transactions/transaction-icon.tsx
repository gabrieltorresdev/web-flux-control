import React, { memo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionIconProps = {
  type: "income" | "expense";
};

function TransactionIconComponent({ type }: TransactionIconProps) {
  const Icon = type === "income" ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className={cn(
        "p-2 rounded-full",
        type === "income" ? "bg-emerald-100" : "bg-rose-100"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4",
          type === "income" ? "text-emerald-600" : "text-rose-600"
        )}
      />
    </div>
  );
}

export const TransactionIcon = memo(TransactionIconComponent);
