import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Category } from "@/features/categories/types";
import { getCategories } from "@/features/categories/actions/categories";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  selectedCategoryId: string | null;
  error: string | null;
}

interface CreateCategoryStoreProps {
  initialData?: {
    categories: Category[];
  };
}

interface CategoryActions {
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (categoryId: string, updates: Partial<Category>) => void;
  deleteCategory: (categoryId: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  loadCategories: () => Promise<void>;
  clearStore: () => void;
  forceReload: () => Promise<void>;
}

// Export the store creator
export const createCategoryStore = ({
  initialData,
}: CreateCategoryStoreProps = {}) => {
  const defaultState: CategoryState = {
    categories: initialData?.categories || [],
    isLoading: false,
    selectedCategoryId: null,
    error: null,
  };

  return create<CategoryState & CategoryActions>()(
    persist(
      (set, get) => ({
        ...defaultState,

        setCategories: (categories) => set({ categories }),
        addCategory: (category) =>
          set((state) => ({
            categories: [...state.categories, category],
          })),
        updateCategory: (categoryId, updates) =>
          set((state) => ({
            categories: state.categories.map((cat) =>
              cat.id === categoryId ? { ...cat, ...updates } : cat
            ),
          })),
        deleteCategory: (categoryId) =>
          set((state) => ({
            categories: state.categories.filter((cat) => cat.id !== categoryId),
          })),
        setSelectedCategory: (categoryId) =>
          set({ selectedCategoryId: categoryId }),
        setIsLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),

        loadCategories: async () => {
          const state = get();
          // Se já tiver categorias, não precisa carregar
          if (state.categories.length > 0) return;

          try {
            set({ isLoading: true, error: null });
            const response = await getCategories();
            set({
              categories: response.data,
              isLoading: false,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to load categories";
            set({
              error: errorMessage,
              isLoading: false,
            });
          }
        },

        clearStore: () => {
          set(defaultState);
        },

        forceReload: async () => {
          try {
            set({ isLoading: true, error: null });
            const response = await getCategories();
            set({
              categories: response.data,
              isLoading: false,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to load categories";
            set({
              error: errorMessage,
              isLoading: false,
            });
          }
        },
      }),
      {
        name: "category-store",
        partialize: (state) => ({
          categories: state.categories,
          selectedCategoryId: state.selectedCategoryId,
        }),
      }
    )
  );
};

// Create selectors factory
export const createCategorySelectors =
  (store: ReturnType<typeof createCategoryStore>) => () => {
    const categories = store((state) => state.categories);
    const selectedCategoryId = store((state) => state.selectedCategoryId);
    const isLoading = store((state) => state.isLoading);
    const error = store((state) => state.error);

    return {
      categories,
      selectedCategoryId,
      isLoading,
      error,
      // Memoized category getters
      selectedCategory: categories.find((cat) => cat.id === selectedCategoryId),
      incomeCategories: categories.filter((cat) => cat.type === "income"),
      expenseCategories: categories.filter((cat) => cat.type === "expense"),
      getCategoryById: (id: string) => categories.find((cat) => cat.id === id),
    };
  };

// Create the default store and selectors
export const useCategoryStore = createCategoryStore();
const useCategorySelectors = createCategorySelectors(useCategoryStore);
