import { CategoryList } from "@/components/category/category-list";
import { NewCategoryButton } from "@/components/category/new-category-button";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getCategories } from "@/app/actions/categories";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoriesPage() {
  // Fetch initial data on the server
  const initialCategories = await getCategories();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 px-3">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-muted-foreground text-sm font-medium">
            Minhas <strong className="text-primary">categorias</strong>
          </h1>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<LoadingSpinner />}>
        <CategoryList initialData={initialCategories} />
      </Suspense>

      <NewCategoryButton />
    </div>
  );
}
