import { CategoryList } from "@/components/category/category-list";
import { NewCategoryButton } from "@/components/category/new-category-button";
import { getCategories } from "@/app/actions/categories";
import { AnimatedPage } from "@/components/layout/animated-page";

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

        {/* Renderiza inicialmente sem animações para melhor performance */}
        <CategoryList initialData={initialCategories} skipAnimation={true} />

        <NewCategoryButton />
      </div>
    </AnimatedPage>
  );
}
