"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategorySelectItem } from "../../category/category-select-item";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CategoryService } from "@/services/category-service";

interface CategoryBadgeProps {
  categoryId: string;
  onRemove: () => void;
}

const categoryService = new CategoryService();

export function CategoryBadge({ categoryId, onRemove }: CategoryBadgeProps) {
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories", ""],
    queryFn: async () => {
      return await categoryService.findAllPaginated("");
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const categories = categoriesResponse?.data ?? [];
  const category = categories.find((cat) => cat.id === categoryId);

  if (!category) return null;

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
