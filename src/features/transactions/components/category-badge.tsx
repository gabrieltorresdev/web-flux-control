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
      variant="outline"
      className={cn(
        "gap-1 pl-2 pr-1 py-0.5 h-6 whitespace-nowrap group",
        isIncome
          ? "bg-success/5 hover:bg-success/10 text-success border-success/30 hover:border-success/40"
          : "bg-expense/5 hover:bg-expense/10 text-expense border-expense/30 hover:border-expense/40",
        "transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-1">
        <CategoryIcon
          icon={category.icon}
          isIncome={isIncome}
          className="h-3 w-3"
        />
        <span className="truncate max-w-[80px] text-xs">
          {category.name}
        </span>
      </div>
      <FilterButton
        onClick={onRemove}
        className={cn(
          "h-4 w-4 rounded-full",
          isIncome ? "group-hover:bg-success/20" : "group-hover:bg-expense/20"
        )}
      >
        <X className="h-2.5 w-2.5" />
      </FilterButton>
    </MotionBadge>
  );
}
