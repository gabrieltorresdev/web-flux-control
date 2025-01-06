"use client";

import { Category } from "@/types/category";
import { memo } from "react";
import { Card } from "../ui/card";
import { CategoryItem } from "./category-item";
import { Tag } from "lucide-react";
import { ApiPaginatedResponse } from "@/types/service";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryGroupProps {
  title: string;
  categories: Category[];
  type: "default" | "custom";
  skipAnimation?: boolean;
}

interface CategoryListProps {
  initialData: ApiPaginatedResponse<Category[]>;
  skipAnimation?: boolean;
}

const EmptyState = memo(function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-48 space-y-4">
      <Tag className="h-12 w-12 text-muted-foreground/50" />
      <p className="text-muted-foreground text-center">
        Nenhuma categoria encontrada
      </p>
    </div>
  );
});

const CategoryGroup = memo(function CategoryGroup({
  title,
  categories,
  type,
  skipAnimation = false,
}: CategoryGroupProps) {
  if (!categories.length) return null;

  const GroupWrapper = skipAnimation ? "section" : motion.section;
  const ItemWrapper = skipAnimation ? "div" : motion.div;

  const content = (
    <GroupWrapper
      {...(!skipAnimation && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2 },
      })}
      className="space-y-3"
    >
      <Card
        className={cn(
          "overflow-hidden border-0 bg-transparent shadow-none",
          "sm:bg-background sm:border sm:shadow-sm"
        )}
      >
        <div
          className={cn(
            "divide-y divide-border/50",
            "sm:divide-y sm:space-y-0",
            "rounded-xl bg-background shadow-sm space-y-2 divide-y-0 sm:rounded-none sm:shadow-none"
          )}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <h2 className="text-base font-medium text-foreground/90">
              {title}
            </h2>
            <span className="text-sm font-medium text-muted-foreground">
              ({categories.length})
            </span>
          </div>

          {skipAnimation ? (
            <div className="grid gap-0 divide-y divide-border/50">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    "rounded-xl sm:rounded-none overflow-hidden",
                    type === "default" && "opacity-90 bg-muted/50"
                  )}
                >
                  <CategoryItem category={category} />
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {categories.map((category, index) => (
                <ItemWrapper
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    duration: 0.2,
                    delay: Math.min(index * 0.03, 0.3),
                  }}
                  className={cn(
                    "rounded-xl sm:rounded-none overflow-hidden",
                    type === "default" && "opacity-90 bg-muted/50"
                  )}
                >
                  <CategoryItem category={category} />
                </ItemWrapper>
              ))}
            </AnimatePresence>
          )}
        </div>
      </Card>
    </GroupWrapper>
  );

  return content;
});

const CategoryColumn = memo(function CategoryColumn({
  title,
  customCategories,
  defaultCategories,
  skipAnimation = false,
}: {
  title: string;
  customCategories: Category[];
  defaultCategories: Category[];
  skipAnimation?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-1">
        <h2 className="text-lg font-semibold text-foreground/90">{title}</h2>
        <span className="text-sm text-muted-foreground">
          ({customCategories.length + defaultCategories.length})
        </span>
      </div>

      {customCategories.length > 0 && (
        <CategoryGroup
          title="Personalizadas"
          categories={customCategories}
          type="custom"
          skipAnimation={skipAnimation}
        />
      )}

      {defaultCategories.length > 0 && (
        <CategoryGroup
          title="Padrão"
          categories={defaultCategories}
          type="default"
          skipAnimation={skipAnimation}
        />
      )}
    </div>
  );
});

export const CategoryList = memo(function CategoryList({
  initialData,
  skipAnimation = false,
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
    <div className={cn(!skipAnimation && "animate-in fade-in-50 duration-300")}>
      {/* Mobile Layout */}
      <div className="space-y-6 sm:hidden">
        {/* Custom Categories */}
        {(customExpenseCategories.length > 0 ||
          customIncomeCategories.length > 0) && (
          <div className="space-y-6">
            <CategoryGroup
              title="Despesas"
              categories={customExpenseCategories}
              type="custom"
              skipAnimation={skipAnimation}
            />
            <CategoryGroup
              title="Receitas"
              categories={customIncomeCategories}
              type="custom"
              skipAnimation={skipAnimation}
            />
          </div>
        )}

        {/* Default Categories */}
        {(defaultExpenseCategories.length > 0 ||
          defaultIncomeCategories.length > 0) && (
          <div className="space-y-6">
            <CategoryGroup
              title="Despesas Padrão"
              categories={defaultExpenseCategories}
              type="default"
              skipAnimation={skipAnimation}
            />
            <CategoryGroup
              title="Receitas Padrão"
              categories={defaultIncomeCategories}
              type="default"
              skipAnimation={skipAnimation}
            />
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-2 gap-8">
          <CategoryColumn
            title="Despesas"
            customCategories={customExpenseCategories}
            defaultCategories={defaultExpenseCategories}
            skipAnimation={skipAnimation}
          />
          <CategoryColumn
            title="Receitas"
            customCategories={customIncomeCategories}
            defaultCategories={defaultIncomeCategories}
            skipAnimation={skipAnimation}
          />
        </div>
      </div>
    </div>
  );
});
