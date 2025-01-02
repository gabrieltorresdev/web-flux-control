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
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3 px-3">
      <div className="text-muted-foreground text-sm md:text-base text-center">
        Gerencie suas <strong>categorias</strong> de transações
      </div>
      <div className="flex flex-col gap-3">
        <NewCategoryButton />
        <Suspense fallback={<LoadingSpinner />}>
          <CategoryList initialData={initialCategories} />
        </Suspense>
      </div>
    </div>
  );
}
