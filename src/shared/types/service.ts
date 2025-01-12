export type ApiResponse<T> = {
  message: string;
  data: T;
};

export interface ApiPaginatedResponse<T> extends ApiResponse<T> {
  meta: {
    current_page: number;
    last_page: number;
    perPage: number;
    total: number;
    from: number;
    to: number;
  };
}
