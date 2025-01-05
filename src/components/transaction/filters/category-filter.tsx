"use client";

import { memo } from "react";
import { CategorySelector } from "@/components/category/category-selector";

interface CategoryFilterProps {
  initialCategoryId?: string;
  showAsBadge?: boolean;
  onCategoryChange?: (categoryId: string | undefined) => void;
}

export const CategoryFilter = memo(function CategoryFilter({
  initialCategoryId,
  showAsBadge = false,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <CategorySelector
      value={initialCategoryId}
      onChange={onCategoryChange}
      showAsBadge={showAsBadge}
    />
  );
});
