"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CategoryGrid } from "../category-selection/category-grid";
import type { Category } from "@/types/category";
import type { StepProps } from "./types";

type CategoryStepProps = StepProps & {
  categories: Category[];
  selectedCategory?: string;
};

export function CategoryStep({ 
  categories, 
  selectedCategory,
  onNext,
  onCancel,
  onBack
}: CategoryStepProps) {
  const handleSelect = (category: Category) => {
    onNext({
      categoryId: category.id,
      type: category.type,
    });
  };

  return (
    <div className="space-y-4">
      <CategoryGrid
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={handleSelect}
      />

      <div className="flex justify-end gap-2">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
        )}
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={() => selectedCategory && handleSelect(categories.find(c => c.id === selectedCategory)!)}
          disabled={!selectedCategory}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}