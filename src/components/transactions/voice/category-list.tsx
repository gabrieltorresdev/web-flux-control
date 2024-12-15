"use client";

import { memo } from "react";
import { Category } from "@/types/category";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type CategoryListProps = {
  categories: Category[];
  selectedCategory?: string;
};

function CategoryListComponent({
  categories = [],
  selectedCategory,
}: CategoryListProps) {
  const sortedCategories = Array.isArray(categories)
    ? [...categories].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  if (sortedCategories.length === 0) {
    return (
      <ScrollArea className="h-48 rounded-md border">
        <div className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            Nenhuma categoria encontrada
          </p>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-48 rounded-md border">
      <div className="p-4 space-y-2">
        {sortedCategories.map((category) => (
          <div
            key={category.id}
            className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
              category.id === selectedCategory
                ? "bg-primary/10"
                : "hover:bg-accent"
            }`}
          >
            <span className="font-medium">{category.name}</span>
            <Badge
              variant="outline"
              // className={cn(
              //   category.type === "income" ? "success" : "destructive"
              // )}
            >
              {category.type === "income" ? "Entrada" : "Saída"}
            </Badge>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export const CategoryList = memo(CategoryListComponent);
