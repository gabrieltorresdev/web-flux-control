import { CATEGORIES } from "@/types/transaction";

export type Category = {
  value: string;
  label: string;
};

export class CategoryService {
  async search(query?: string): Promise<Category[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const categories = Object.entries(CATEGORIES).map(([value, label]) => ({
      value,
      label,
    }));

    if (!query) return categories;

    return categories.filter((category) =>
      category.label.toLowerCase().includes(query.toLowerCase())
    );
  }
}
