export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  isDefault: boolean;
  icon?: string;
}

export interface CreateCategoryInput {
  name: string;
  type: "income" | "expense";
  icon?: string;
}
