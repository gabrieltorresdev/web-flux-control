import { CategoryService } from "@/src/services/category-service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CreateCategoryInput } from "../types/category";

export function useCategories(searchTerm?: string) {
  return useQuery({
    queryKey: ["categories", searchTerm],
    queryFn: () => new CategoryService().findAllPaginated(searchTerm),
  });
}

export function useCreateCategory() {
  return useMutation({
    mutationFn: (data: CreateCategoryInput) =>
      new CategoryService().create(data),
  });
}

export function useFindCategoryByName(name: string) {
  return useQuery({
    queryKey: ["category", name],
    queryFn: () => new CategoryService().findByName(name),
    enabled: !!name,
  });
}
