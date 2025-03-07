"use client";

import { Category } from "@/features/categories/types";
import { Badge } from "@/shared/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/shared/utils";
import { motion } from "framer-motion";
import { FilterButton } from "@/features/transactions/components/filter-button";
import { CategoryIcon } from "@/features/categories/components/category-icon";

interface CategoryBadgeProps {
  category: Category;
  onRemove: () => void;
  className?: string;
}

const MotionBadge = motion.create(Badge);

export function CategoryBadge({
  category,
  onRemove,
  className,
}: CategoryBadgeProps) {
  const isIncome = category.type === "income";

  return (
    <MotionBadge
      variant="default"
      className={cn(
        "gap-1.5 pl-2 pr-1 py-0 whitespace-nowrap group inline-flex items-center",
        isIncome
          ? "bg-[hsl(var(--income)/0.08)] hover:bg-[hsl(var(--income)/0.12)] text-[hsl(var(--income-foreground))] border-[hsl(var(--income)/0.2)] hover:border-[hsl(var(--income)/0.3)]"
          : "bg-[hsl(var(--expense)/0.08)] hover:bg-[hsl(var(--expense)/0.12)] text-[hsl(var(--expense-foreground))] border-[hsl(var(--expense)/0.2)] hover:border-[hsl(var(--expense)/0.3)]",
        "border transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <CategoryIcon
          icon={category.icon}
          isIncome={isIncome}
          className="h-3 w-3 opacity-70"
        />
        <span className="truncate max-w-[200px] text-xs font-medium">
          {category.name}
        </span>
      </div>
      <FilterButton
        onClick={onRemove}
        className={cn(
          "group-hover:bg-background/50",
          isIncome
            ? "group-hover:bg-[hsl(var(--income)/0.12)]"
            : "group-hover:bg-[hsl(var(--expense)/0.12)]"
        )}
      >
        <X className="h-3 w-3" />
      </FilterButton>
    </MotionBadge>
  );
}
