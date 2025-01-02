"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategorySelectItem } from "../../category/category-select-item";
import { X } from "lucide-react";
import { Category } from "@/types/category";

interface CategoryBadgeProps {
  category: Category;
  onRemove: () => void;
}

export function CategoryBadge({ category, onRemove }: CategoryBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1 whitespace-nowrap">
      <CategorySelectItem category={category} showType={false} compact />
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 hover:bg-transparent"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
}
