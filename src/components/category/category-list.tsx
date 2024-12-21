"use client";

import { useCategories } from "@/src/hooks/use-categories";
import { Category } from "@/src/types/category";
import { memo } from "react";
import { Card } from "../ui/card";
import { CategoryItem } from "./category-item";
import { Tag } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";

interface CategoryGroupProps {
  title: string;
  categories: Category[];
}

export const CategoryList = memo(() => {
  const { data: categoriesResponse, isLoading } = useCategories();
  const categories = categoriesResponse?.data ?? [];

  if (isLoading) {
    return <CategoryListSkeleton />;
  }

  if (!categories.length) {
    return <EmptyState />;
  }

  const defaultExpenseCategories = categories.filter(
    (cat) => cat.type === "expense" && cat.is_default
  );
  const defaultIncomeCategories = categories.filter(
    (cat) => cat.type === "income" && cat.is_default
  );
  const customExpenseCategories = categories.filter(
    (cat) => cat.type === "expense" && !cat.is_default
  );
  const customIncomeCategories = categories.filter(
    (cat) => cat.type === "income" && !cat.is_default
  );

  return (
    <div className="space-y-6">
      {/* Default Categories */}
      {(defaultExpenseCategories.length > 0 ||
        defaultIncomeCategories.length > 0) && (
        <Collapsible>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Categorias padrão</p>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-2">
            <Card className="bg-muted/30">
              <div className="divide-y divide-muted">
                {defaultExpenseCategories.map((category) => (
                  <CategoryItem key={category.id} category={category} />
                ))}
                {defaultIncomeCategories.map((category) => (
                  <CategoryItem key={category.id} category={category} />
                ))}
              </div>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Custom Categories */}
      {(customExpenseCategories.length > 0 ||
        customIncomeCategories.length > 0) && (
        <div className="space-y-6">
          <CategoryGroup
            title="Despesas"
            categories={customExpenseCategories}
          />
          <CategoryGroup title="Receitas" categories={customIncomeCategories} />
        </div>
      )}
    </div>
  );
});

const CategoryGroup = memo(({ title, categories }: CategoryGroupProps) => {
  if (!categories.length) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Card>
        <div className="divide-y">
          {categories.map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))}
        </div>
      </Card>
    </section>
  );
});

const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <Tag className="h-12 w-12 text-muted-foreground/50" />
    <p className="text-muted-foreground text-center">
      Nenhuma categoria encontrada
    </p>
  </div>
));

const CategoryListSkeleton = memo(() => (
  <div className="space-y-6">
    {[...Array(2)].map((_, groupIndex) => (
      <div key={groupIndex} className="space-y-3">
        <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />
        <Card>
          <div className="divide-y">
            {[...Array(3)].map((_, itemIndex) => (
              <div
                key={itemIndex}
                className="p-4 flex items-center justify-between"
              >
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    ))}
  </div>
));

CategoryList.displayName = "CategoryList";
CategoryGroup.displayName = "CategoryGroup";
EmptyState.displayName = "EmptyState";
CategoryListSkeleton.displayName = "CategoryListSkeleton";
