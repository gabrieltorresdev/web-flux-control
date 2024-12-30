import { Category } from "@/types/category";
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
      <span className={compact ? "text-xs" : "text-sm"}>{category.name}</span>
      {showType && (
        <span
          className={`text-xs ${
            isIncome ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          {isIncome ? "Receita" : "Despesa"}
        </span>
      )}
    </div>
  );
}
