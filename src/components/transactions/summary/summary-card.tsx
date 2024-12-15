"use client";

import { memo } from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SummaryCardSkeleton } from "./summary-card-skeleton";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "income" | "expense";
  isLoading?: boolean;
  hasError?: boolean;
}

function SummaryCardComponent({
  title,
  value,
  icon: Icon,
  variant = "default",
  isLoading = false,
  hasError = false,
}: SummaryCardProps) {
  if (isLoading) {
    return <SummaryCardSkeleton />;
  }

  const formattedValue = typeof value === "number" 
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value)
    : value;

  return (
    <Card className="relative overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 opacity-5",
          variant === "income" && "bg-emerald-500",
          variant === "expense" && "bg-rose-500",
          variant === "default" && "bg-violet-500"
        )}
      />
      <div className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div
            className={cn(
              "p-2 rounded-full",
              variant === "income" && "bg-emerald-100 text-emerald-500",
              variant === "expense" && "bg-rose-100 text-rose-500",
              variant === "default" && "bg-violet-100 text-violet-500",
              hasError && "opacity-50"
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <p
          className={cn(
            "mt-4 text-2xl font-bold",
            variant === "income" && "text-emerald-500",
            variant === "expense" && "text-rose-500",
            variant === "default" && "text-violet-500",
            hasError && "opacity-50"
          )}
        >
          {formattedValue}
        </p>
      </div>
    </Card>
  );
}

export const SummaryCard = memo(SummaryCardComponent);