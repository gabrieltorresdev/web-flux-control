import { CategoryList } from "@/src/components/category/category-list";
import { NewCategoryButton } from "@/src/components/category/new-category-button";

export default function CategoriesPage() {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3 px-3">
      <div className="text-muted-foreground text-sm md:text-base text-center">
        Gerencie suas <strong>categorias</strong> de transações
      </div>
      <div className="flex flex-col gap-3">
        <NewCategoryButton />
        <CategoryList />
      </div>
    </div>
  );
}
