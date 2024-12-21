import { CategoryList } from "@/src/components/category/category-list";
import { NewCategoryButton } from "@/src/components/category/new-category-button";

export default function CategoriesPage() {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">
      <div>
        <h1 className="text-3xl font-bold">Categorias</h1>
        <p className="text-muted-foreground">
          Gerencie suas categorias de transações
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <NewCategoryButton />
        <CategoryList />
      </div>
    </div>
  );
}
