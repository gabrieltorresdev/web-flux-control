export type ApiCategory = {
  id: string;
  name: string;
  type: "income" | "expense";
};

export type ApiResponse<T> = {
  message: string;
  data: T;
};

export interface ApiPaginatedResponse<T> extends ApiResponse<T> {
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}
