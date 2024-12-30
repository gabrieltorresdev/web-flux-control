"use client";

import { useCategories } from "@/hooks/use-categories";
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
import { cn } from "@/lib/utils";
import { ErrorState } from "../ui/error-state";

interface CategoryGroupProps {
  title: string;
  categories: Category[];
}

export const CategoryList = memo(() => {
  const {
    data: categoriesResponse,
    isLoading,
    isError,
    refetch,
  } = useCategories();
  const categories = categoriesResponse?.data ?? [];

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar categorias"
        description="Não foi possível carregar a lista de categorias. Por favor, tente novamente."
        onRetry={() => refetch()}
      />
    );
  }

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
    <div className="animate-in fade-in-50 duration-500 space-y-6">
      {/* Default Categories */}
      {(defaultExpenseCategories.length > 0 ||
        defaultIncomeCategories.length > 0) && (
        <Collapsible>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-700">
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
                  <ChevronDown className="h-4 w-4" />
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

const CategoryGroup = memo(({ title, categories }: CategoryGroupProps) => {
  if (!categories.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-700">{title}</h2>
          <span className="text-sm text-muted-foreground">
            ({categories.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
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

const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center h-48 space-y-4 animate-in fade-in-50">
    <Tag className="h-12 w-12 text-muted-foreground/50" />
    <p className="text-muted-foreground text-center">
      Nenhuma categoria encontrada
    </p>
  </div>
));

const CategoryListSkeleton = memo(() => (
  <div className="space-y-6">
    {[...Array(2)].map((_, groupIndex) => (
      <section key={groupIndex} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
        </div>
        <Card className="overflow-hidden">
          <div className="divide-y">
            {[...Array(3)].map((_, itemIndex) => (
              <div key={itemIndex} className="p-3 flex items-center gap-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
      </section>
    ))}
  </div>
));

CategoryList.displayName = "CategoryList";
CategoryGroup.displayName = "CategoryGroup";
EmptyState.displayName = "EmptyState";
CategoryListSkeleton.displayName = "CategoryListSkeleton";
