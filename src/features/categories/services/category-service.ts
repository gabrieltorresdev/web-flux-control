import { HttpClient } from "@/shared/lib/api/http-client";
import { getBackendApiUrl } from "@/shared/lib/config";
import { ApiPaginatedResponse, ApiResponse } from "@/shared/types/service";
import { Category, CreateCategoryInput } from "@/features/categories/types";

export class CategoryService {
  private httpClient: HttpClient;
  private route: string;

  constructor() {
    this.httpClient = new HttpClient();
    this.route = "categories";
  }

  public async findAllPaginated(
    name?: string
  ): Promise<ApiPaginatedResponse<Category[]>> {
    return this.httpClient.get<ApiPaginatedResponse<Category[]>>(
      getBackendApiUrl(this.route) + (name ? `?name=${name}` : ""),
      true
    );
  }

  public async findById(id: string): Promise<ApiResponse<Category>> {
    return this.httpClient.get<ApiResponse<Category>>(
      `${getBackendApiUrl(this.route)}/${id}`,
      true
    );
  }

  public async findByName(name: string): Promise<ApiResponse<Category>> {
    return this.httpClient.get<ApiResponse<Category>>(
      `${getBackendApiUrl(this.route)}/by-name/${name}`,
      true
    );
  }

  public async create(
    data: CreateCategoryInput
  ): Promise<ApiResponse<Category>> {
    return this.httpClient.post<ApiResponse<Category>, CreateCategoryInput>(
      getBackendApiUrl(this.route),
      data,
      true
    );
  }

  public async delete(id: string): Promise<void> {
    this.httpClient.delete(getBackendApiUrl(`${this.route}/${id}`), true);
  }

  public async update(data: Category): Promise<ApiResponse<Category>> {
    return this.httpClient.put<ApiResponse<Category>, Category>(
      `${getBackendApiUrl(this.route)}/${data.id}`,
      data,
      true
    );
  }
}
