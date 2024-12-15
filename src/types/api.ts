export type ApiCategory = {
  id: string;
  name: string;
  type: "income" | "expense";
};

export type ApiTransaction = {
  id: string;
  title: string;
  amount: number;
  dateTime: string;
  category: ApiCategory;
};

export type ApiResponse<T> = {
  message: string;
  data: T;
};

interface ApiPaginatedResponse<T> extends ApiResponse<T> {
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export type ApiTransactionResponse = ApiPaginatedResponse<ApiTransaction[]>;

export type CreateTransactionDTO = {
  categoryId: string;
  amount: number;
  dateTime: string;
  title: string;
};
