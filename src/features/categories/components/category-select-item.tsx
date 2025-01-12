import { Category } from "@/features/categories/types";
import { CategoryIcon } from "./category-icon";

interface CategorySelectItemProps {
  category: Category;
  showType?: boolean;
  compact?: boolean;
}

export function CategorySelectItem({
  category,
  showType = true,
  compact = false,
}: CategorySelectItemProps) {
  const isIncome = category.type === "income";

  return (
    <div className="flex items-center gap-2">
      <CategoryIcon
        icon={category.icon}
        isIncome={isIncome}
        className={compact ? "h-4 w-4" : "h-5 w-5"}
      />
      <span
        className={
          compact ? "text-xs text-foreground/90" : "text-sm text-foreground/90"
        }
      >
        {category.name}
      </span>
      {showType && (
        <span
          className={`text-xs ${
            isIncome
              ? "text-emerald-500 dark:text-emerald-400"
              : "text-rose-500 dark:text-rose-400"
          }`}
        >
          {isIncome ? "Receita" : "Despesa"}
        </span>
      )}
    </div>
  );
}
