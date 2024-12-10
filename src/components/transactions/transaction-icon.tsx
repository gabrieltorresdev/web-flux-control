import React, { memo } from "react";
import { Coffee, ShoppingCart, Briefcase, Gift, Car, Home } from "lucide-react";

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
      className={`p-2 rounded-full ${
        type === "income" ? "bg-green-100" : "bg-red-100"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${
          type === "income" ? "text-green-600" : "text-red-600"
        }`}
      />
    </div>
  );
}

export const TransactionIcon = memo(TransactionIconComponent);
