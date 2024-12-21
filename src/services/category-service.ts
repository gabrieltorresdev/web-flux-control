import { HttpClient } from "@/src/lib/api/http-client";
import { getBackendApiUrl } from "@/src/lib/config";
import { ApiPaginatedResponse, ApiResponse } from "@/src/types/service";
import { Category, CreateCategoryInput } from "@/src/types/category";

export class CategoryService {
  private httpClient: HttpClient;
  private route: string;

  constructor() {
    this.httpClient = new HttpClient();
    this.route = "transactions-categories";
  }

  public async findAllPaginated(
    name?: string
  ): Promise<ApiPaginatedResponse<Category[]>> {
    return this.httpClient.get<ApiPaginatedResponse<Category[]>>(
      getBackendApiUrl(this.route) + (name ? `?name=${name}` : "")
    );
  }

  public async findByName(name: string): Promise<ApiResponse<Category>> {
    return this.httpClient.get<ApiResponse<Category>>(
      `${getBackendApiUrl(this.route)}/by-name/${name}`
    );
  }

  public async create(
    data: CreateCategoryInput
  ): Promise<ApiResponse<Category>> {
    return this.httpClient.post<ApiResponse<Category>, CreateCategoryInput>(
      getBackendApiUrl(this.route),
      data
    );
  }

  public async delete(id: string): Promise<void> {
    this.httpClient.delete(getBackendApiUrl(`${this.route}/${id}`));
  }

  public async update(data: Category): Promise<ApiResponse<Category>> {
    return this.httpClient.put<ApiResponse<Category>, Category>(
      `${getBackendApiUrl(this.route)}/${data.id}`,
      data
    );
  }
}
