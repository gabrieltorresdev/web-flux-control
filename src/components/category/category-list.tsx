"use client";

import { Category } from "@/types/category";
import { memo } from "react";
import { Card } from "../ui/card";
import { CategoryItem } from "./category-item";
import { Tag } from "lucide-react";
import { ApiPaginatedResponse } from "@/types/service";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface CategoryGroupProps {
  title: string;
  categories: Category[];
  type: "default" | "custom";
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

const CategoryGroup = memo(function CategoryGroup({
  title,
  categories,
  type,
}: CategoryGroupProps) {
  const isMobile = useIsMobile();

  if (!categories.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <Card
        className={cn(
          "overflow-hidden border-0 bg-transparent shadow-none",
          !isMobile && "bg-background border shadow-sm"
        )}
      >
        <div
          className={cn(
            "divide-y divide-border/50",
            isMobile &&
              "rounded-xl bg-background shadow-sm space-y-2 divide-y-0"
          )}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <h2 className="text-base font-medium text-foreground/80">
              {title}
            </h2>
            <span className="text-sm text-muted-foreground">
              ({categories.length})
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  isMobile && "rounded-xl overflow-hidden",
                  type === "default" && "opacity-75"
                )}
              >
                <CategoryItem category={category} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>
    </motion.section>
  );
});

const CategoryColumn = memo(function CategoryColumn({
  title,
  customCategories,
  defaultCategories,
}: {
  title: string;
  customCategories: Category[];
  defaultCategories: Category[];
}) {
  return (
    <div className="space-y-8">
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
        />
      )}

      {defaultCategories.length > 0 && (
        <CategoryGroup
          title="Padrão"
          categories={defaultCategories}
          type="default"
        />
      )}
    </div>
  );
});

export const CategoryList = memo(function CategoryList({
  initialData,
}: CategoryListProps) {
  const categories = initialData.data;
  const isMobile = useIsMobile();

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

  if (isMobile) {
    return (
      <div className="animate-in fade-in-50 duration-500 space-y-8">
        {/* Custom Categories */}
        {(customExpenseCategories.length > 0 ||
          customIncomeCategories.length > 0) && (
          <div className="space-y-8">
            <CategoryGroup
              title="Despesas"
              categories={customExpenseCategories}
              type="custom"
            />
            <CategoryGroup
              title="Receitas"
              categories={customIncomeCategories}
              type="custom"
            />
          </div>
        )}

        {/* Default Categories */}
        {(defaultExpenseCategories.length > 0 ||
          defaultIncomeCategories.length > 0) && (
          <div className="space-y-8">
            <CategoryGroup
              title="Despesas Padrão"
              categories={defaultExpenseCategories}
              type="default"
            />
            <CategoryGroup
              title="Receitas Padrão"
              categories={defaultIncomeCategories}
              type="default"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-50 duration-500">
      <div className="grid grid-cols-2 gap-8">
        <CategoryColumn
          title="Despesas"
          customCategories={customExpenseCategories}
          defaultCategories={defaultExpenseCategories}
        />
        <CategoryColumn
          title="Receitas"
          customCategories={customIncomeCategories}
          defaultCategories={defaultIncomeCategories}
        />
      </div>
    </div>
  );
});
