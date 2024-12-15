"use client";

import React, { memo } from "react";
import { Category } from "@/types/category";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategoryTabs } from "../hooks/use-category-tabs";

type CategoryGridProps = {
  categories: Category[];
  selectedCategory?: string;
  onSelect: (category: Category) => void;
};

function CategoryGridComponent({
  categories,
  selectedCategory,
  onSelect,
}: CategoryGridProps) {
  const { 
    activeTab,
    incomeCategories,
    expenseCategories,
    handleTabChange
  } = useCategoryTabs(categories);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="expense" className="flex items-center gap-2">
          <ArrowDownRight className="w-4 h-4" />
          Saídas
        </TabsTrigger>
        <TabsTrigger value="income" className="flex items-center gap-2">
          <ArrowUpRight className="w-4 h-4" />
          Entradas
        </TabsTrigger>
      </TabsList>

      <ScrollArea className="h-[300px] rounded-md border">
        <TabsContent value="expense" className="m-0">
          <div className="grid grid-cols-2 gap-2 p-4">
            {expenseCategories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="income" className="m-0">
          <div className="grid grid-cols-2 gap-2 p-4">
            {incomeCategories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}

type CategoryButtonProps = {
  category: Category;
  isSelected: boolean;
  onSelect: (category: Category) => void;
};

const CategoryButton = memo(({ 
  category, 
  isSelected, 
  onSelect 
}: CategoryButtonProps) => (
  <button
    onClick={() => onSelect(category)}
    className={cn(
      "flex items-center gap-2 p-3 rounded-lg transition-colors text-left",
      "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      isSelected
        ? "bg-primary text-primary-foreground"
        : "bg-card hover:bg-accent"
    )}
  >
    <span className="truncate">{category.name}</span>
  </button>
));

CategoryButton.displayName = "CategoryButton";

export const CategoryGrid = memo(CategoryGridComponent);