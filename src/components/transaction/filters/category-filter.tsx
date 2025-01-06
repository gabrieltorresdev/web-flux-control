"use client";

import { memo } from "react";
import { CategorySelector } from "@/components/category/category-selector";
import { createCategoryStore } from "@/stores/category-store";
import { Category } from "@/types/category";

interface CategoryFilterProps {
  initialCategoryId?: string;
  initialCategory?: Category;
  showAsBadge?: boolean;
  onCategoryChange?: (
    categoryId: string | undefined,
    category?: Category
  ) => void;
  insideSheet?: boolean;
  store?: ReturnType<typeof createCategoryStore>;
}

export const CategoryFilter = memo(function CategoryFilter({
  initialCategoryId,
  initialCategory,
  showAsBadge = false,
  onCategoryChange,
  insideSheet = false,
  store,
}: CategoryFilterProps) {
  return (
    <CategorySelector
      value={initialCategoryId}
      selectedCategory={initialCategory}
      onChange={onCategoryChange}
      showAsBadge={showAsBadge}
      insideSheet={insideSheet}
      showAllOption={true}
      store={store}
    />
  );
});
