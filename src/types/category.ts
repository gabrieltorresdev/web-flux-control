export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

export interface CreateCategoryInput {
  name: string;
  type: "income" | "expense";
}
