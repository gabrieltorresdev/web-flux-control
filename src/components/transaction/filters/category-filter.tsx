"use client";

import { memo } from "react";
import { CategorySelector } from "@/components/category/category-selector";

interface CategoryFilterProps {
  initialCategoryId?: string;
  showAsBadge?: boolean;
  onCategoryChange?: (categoryId: string | undefined) => void;
  insideSheet?: boolean;
}

export const CategoryFilter = memo(function CategoryFilter({
  initialCategoryId,
  showAsBadge = false,
  onCategoryChange,
  insideSheet = false,
}: CategoryFilterProps) {
  return (
    <CategorySelector
      value={initialCategoryId}
      onChange={onCategoryChange}
      showAsBadge={showAsBadge}
      insideSheet={insideSheet}
      showAllOption={true}
    />
  );
});
