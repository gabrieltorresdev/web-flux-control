import { HttpClient } from "@/lib/api/http-client";
import { getApiUrl } from "@/lib/config";
import { Category, CategoryInput } from "@/types/category";
import { ApiCategory, ApiResponse } from "@/types/api";

export class ApiCategoryService {
  private static mapToCategory(apiCategory: ApiCategory): Category {
    return {
      id: apiCategory.id,
      name: apiCategory.name,
      type: apiCategory.type,
    };
  }

  private static mapToCategoryInput(
    category: CategoryInput
  ): Omit<ApiCategory, "id"> {
    return {
      name: category.name,
      type: category.type,
    };
  }

  async getAll(type?: "income" | "expense"): Promise<Category[]> {
    const url = getApiUrl(
      `transactions-categories${type ? `?type=${type}` : ""}`
    );
    const response = await HttpClient.get<ApiResponse<ApiCategory[]>>(url);
    return response.data.map(ApiCategoryService.mapToCategory);
  }

  async search(query?: string, type?: Category["type"]): Promise<Category[]> {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (type) params.set("type", type);

    const url = getApiUrl(`transactions-categories?${params.toString()}`);
    const response = await HttpClient.get<ApiResponse<ApiCategory[]>>(url);
    return response.data.map(ApiCategoryService.mapToCategory);
  }

  async getById(id: string): Promise<Category | null> {
    const url = getApiUrl(`transactions-categories/${id}`);
    try {
      const response = await HttpClient.get<ApiResponse<ApiCategory>>(url);
      return ApiCategoryService.mapToCategory(response.data);
    } catch {
      return null;
    }
  }

  async create(category: CategoryInput): Promise<Category> {
    const url = getApiUrl("transactions-categories");
    const dto = ApiCategoryService.mapToCategoryInput(category);
    const response = await HttpClient.post<ApiResponse<ApiCategory>>(url, dto);
    return ApiCategoryService.mapToCategory(response.data);
  }

  async update(
    id: string,
    category: Partial<CategoryInput>
  ): Promise<Category> {
    const url = getApiUrl(`transactions-categories/${id}`);
    const dto = ApiCategoryService.mapToCategoryInput(
      category as CategoryInput
    );
    const response = await HttpClient.put<ApiResponse<ApiCategory>>(url, dto);
    return ApiCategoryService.mapToCategory(response.data);
  }

  async delete(id: string): Promise<void> {
    const url = getApiUrl(`transactions-categories/${id}`);
    await HttpClient.delete(url);
  }
}
