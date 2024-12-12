import React, { memo } from "react";
import { Coffee, ShoppingCart, Briefcase, Gift, Car, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons = {
  food: Coffee,
  shopping: ShoppingCart,
  work: Briefcase,
  gift: Gift,
  transport: Car,
  home: Home,
} as const;

type TransactionIconProps = {
  category: string;
  type: "income" | "expense";
};

function TransactionIconComponent({ category, type }: TransactionIconProps) {
  const Icon = categoryIcons[category as keyof typeof categoryIcons] || Coffee;

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
