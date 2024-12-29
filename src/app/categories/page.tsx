import { CategoryList } from "@/src/components/category/category-list";
import { NewCategoryButton } from "@/src/components/category/new-category-button";
import {
  prefetchCategories,
  getDehydratedState,
} from "@/src/lib/ssr/prefetch-query";
import { HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";

export default async function CategoriesPage() {
  const queryClient = await prefetchCategories();

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3 px-3">
      <div className="text-muted-foreground text-sm md:text-base text-center">
        Gerencie suas <strong>categorias</strong> de transações
      </div>
      <div className="flex flex-col gap-3">
        <NewCategoryButton />
        <HydrationBoundary state={getDehydratedState(queryClient)}>
          <Suspense fallback={<LoadingSpinner />}>
            <CategoryList />
          </Suspense>
        </HydrationBoundary>
      </div>
    </div>
  );
}
