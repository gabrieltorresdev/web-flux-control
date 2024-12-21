export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  is_default: boolean;
}

export interface CreateCategoryInput {
  name: string;
  type: "income" | "expense";
}
