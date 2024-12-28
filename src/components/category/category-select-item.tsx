import { Category } from "@/src/types/category";
import { CategoryIcon } from "./category-icon";

interface CategorySelectItemProps {
  category: Category;
  showType?: boolean;
}

export function CategorySelectItem({
  category,
  showType = true,
}: CategorySelectItemProps) {
  const isIncome = category.type === "income";

  return (
    <div className="flex items-center gap-2">
      <CategoryIcon
        icon={category.icon}
        isIncome={isIncome}
        className="w-6 h-6"
        iconClassName="h-4 w-4"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{category.name}</span>
        {showType && (
          <span className="text-xs text-muted-foreground">
            {isIncome ? "Receita" : "Despesa"}
          </span>
        )}
      </div>
    </div>
  );
}
