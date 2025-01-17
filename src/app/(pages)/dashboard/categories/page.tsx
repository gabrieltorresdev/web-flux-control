import { CategoryList } from "@/features/categories/components/category-list";
import { NewCategoryButton } from "@/features/categories/components/new-category-button";
import { getCategories } from "@/features/categories/actions/categories";
import { AnimatedPage } from "@/shared/components/layout/animated-page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoriesPage() {
  // Fetch initial data on the server
  const initialCategories = await getCategories();

  return (
    <AnimatedPage className="max-w-4xl mx-auto px-3">
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-muted-foreground text-sm font-medium">
              Minhas <strong className="text-primary">categorias</strong>
            </h1>
          </div>
        </div>

        <CategoryList initialData={initialCategories} />

        <NewCategoryButton />
      </div>
    </AnimatedPage>
  );
}
