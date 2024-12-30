import { CategoryService } from "@/services/category-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, CreateCategoryInput } from "../types/category";
import { queryKeys } from "../lib/get-query-client";
import { ApiResponse } from "../types/api";
import {
  handleValidationError,
  ValidationError,
} from "@/lib/api/error-handler";

export function useCategories(searchTerm?: string) {
  return useQuery({
    queryKey: queryKeys.categories.list({ search: searchTerm }),
    queryFn: () => new CategoryService().findAllPaginated(searchTerm),
    staleTime: 5 * 60 * 1000, // 5 minutes for categories
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Category>,
    ValidationError | Error,
    CreateCategoryInput
  >({
    mutationFn: async (data: CreateCategoryInput) => {
      try {
        return await new CategoryService().create(data);
      } catch (error) {
        throw handleValidationError(error);
      }
    },
    retry: (_, error) => {
      return !(error instanceof ValidationError);
    },
    onSuccess: (newCategory: ApiResponse<Category>) => {
      // Update categories list cache
      queryClient.setQueryData<ApiResponse<Category[]>>(
        queryKeys.categories.all,
        (old: ApiResponse<Category[]> | undefined) => {
          if (!old?.data)
            return { data: [newCategory.data], message: old?.message || "" };
          return {
            data: [...old.data, newCategory.data],
            message: old.message,
          };
        }
      );
      // Invalidate any filtered queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
        exact: false,
        refetchType: "none",
      });
    },
  });
}

export function useFindCategoryByName(name: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.categories.detail(name),
    queryFn: () => new CategoryService().findByName(name),
    enabled: !!name,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: () => {
      // Try to get category from existing queries
      const categories = queryClient.getQueryData<ApiResponse<Category[]>>(
        queryKeys.categories.all
      );
      const foundCategory = categories?.data?.find(
        (cat: Category) => cat.name === name
      );
      if (foundCategory) {
        return { data: foundCategory, message: "" } as ApiResponse<Category>;
      }
      return undefined;
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation<void, ValidationError | Error, string>({
    mutationFn: async (id: string) => {
      try {
        await new CategoryService().delete(id);
      } catch (error) {
        throw handleValidationError(error);
      }
    },
    retry: (_, error) => {
      return !(error instanceof ValidationError);
    },
    onSuccess: (_, deletedId) => {
      // Update categories list cache
      queryClient.setQueryData<ApiResponse<Category[]>>(
        queryKeys.categories.all,
        (old: ApiResponse<Category[]> | undefined) => {
          if (!old?.data) return old;
          return {
            data: old.data.filter((cat: Category) => cat.id !== deletedId),
            message: old.message,
          };
        }
      );
      // Invalidate any filtered queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
        exact: false,
        refetchType: "none",
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Category>, ValidationError | Error, Category>({
    mutationFn: async (data: Category) => {
      try {
        return await new CategoryService().update(data);
      } catch (error) {
        throw handleValidationError(error);
      }
    },
    retry: (_, error) => {
      return !(error instanceof ValidationError);
    },
    onSuccess: (updatedCategory: ApiResponse<Category>) => {
      // Update categories list cache
      queryClient.setQueryData<ApiResponse<Category[]>>(
        queryKeys.categories.all,
        (old: ApiResponse<Category[]> | undefined) => {
          if (!old?.data) return old;
          return {
            data: old.data.map((cat: Category) =>
              cat.id === updatedCategory.data.id ? updatedCategory.data : cat
            ),
            message: old.message,
          };
        }
      );
      // Update individual category cache
      queryClient.setQueryData(
        queryKeys.categories.detail(updatedCategory.data.id),
        updatedCategory
      );
    },
  });
}
