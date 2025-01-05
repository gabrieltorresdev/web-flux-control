"use client";

import { Category } from "@/types/category";
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
import { ChevronDown, ChevronRight } from "lucide-react";
import { ApiPaginatedResponse } from "@/types/service";

interface CategoryGroupProps {
  title: string;
  categories: Category[];
}

interface CategoryListProps {
  initialData: ApiPaginatedResponse<Category[]>;
}

const EmptyState = memo(function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-48 space-y-4 animate-in fade-in-50">
      <Tag className="h-12 w-12 text-muted-foreground/50" />
      <p className="text-muted-foreground text-center">
        Nenhuma categoria encontrada
      </p>
    </div>
  );
});

EmptyState.displayName = "EmptyState";

const CategoryGroup = memo(function CategoryGroup({
  title,
  categories,
}: CategoryGroupProps) {
  if (!categories.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium text-foreground">{title}</h2>
          <span className="text-sm text-muted-foreground">
            ({categories.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ChevronRight
            className="h-4 w-4 text-muted-foreground/50"
            aria-hidden="true"
          />
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="divide-y">
          {categories.map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))}
        </div>
      </Card>
    </section>
  );
});

CategoryGroup.displayName = "CategoryGroup";

export const CategoryList = memo(function CategoryList({
  initialData,
}: CategoryListProps) {
  const categories = initialData.data;

  if (!categories.length) {
    return <EmptyState />;
  }

  const defaultExpenseCategories = categories.filter(
    (cat) => cat.type === "expense" && cat.isDefault
  );
  const defaultIncomeCategories = categories.filter(
    (cat) => cat.type === "income" && cat.isDefault
  );
  const customExpenseCategories = categories.filter(
    (cat) => cat.type === "expense" && !cat.isDefault
  );
  const customIncomeCategories = categories.filter(
    (cat) => cat.type === "income" && !cat.isDefault
  );

  return (
    <div className="animate-in fade-in-50 duration-500 space-y-6">
      {/* Default Categories */}
      {(defaultExpenseCategories.length > 0 ||
        defaultIncomeCategories.length > 0) && (
        <Collapsible>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-foreground">
                Categorias padrão
              </h2>
              <span className="text-sm text-muted-foreground">
                (
                {defaultExpenseCategories.length +
                  defaultIncomeCategories.length}
                )
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent className="mt-3">
            <Card className="overflow-hidden">
              <div className="divide-y">
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

CategoryList.displayName = "CategoryList";
