import { Category, CategoryInput } from "@/types/category";
import { ApiCategoryService } from "./api/category-service";

export class CategoryService {
  private apiService: ApiCategoryService;

  constructor() {
    this.apiService = new ApiCategoryService();
  }

  async getAll(): Promise<Category[]> {
    return this.apiService.getAll();
  }

  async search(query?: string, type?: Category["type"]): Promise<Category[]> {
    return this.apiService.search(query, type);
  }

  async getById(id: string): Promise<Category | null> {
    return this.apiService.getById(id);
  }

  async create(category: CategoryInput): Promise<Category> {
    return this.apiService.create(category);
  }

  async update(id: string, data: Partial<CategoryInput>): Promise<Category> {
    return this.apiService.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.apiService.delete(id);
  }
}
