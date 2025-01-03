export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: {
    current_page: number;
    last_page: number;
    perPage: number;
    total: number;
    from: number;
    to: number;
  };
}
