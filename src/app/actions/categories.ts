"use server";

import { CategoryService } from "@/services/category-service";
import { cache } from "react";
import { CreateCategoryInput, Category } from "@/types/category";
import { revalidatePath } from "next/cache";

// Cache the fetch function to avoid unnecessary refetches
export const getCategories = cache(async (searchTerm?: string) => {
  try {
    const categoryService = new CategoryService();
    return await categoryService.findAllPaginated(searchTerm);
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
});

// Cache the fetch function to avoid unnecessary refetches
export const getCategoryById = cache(async (id: string) => {
  try {
    const categoryService = new CategoryService();
    return await categoryService.findById(id);
  } catch (error) {
    console.error("Error fetching category by id:", error);
    throw error;
  }
});

// Cache the fetch function to avoid unnecessary refetches
export const getCategoryByName = cache(async (name: string) => {
  try {
    const categoryService = new CategoryService();
    return await categoryService.findByName(name);
  } catch (error) {
    console.error("Error fetching category by name:", error);
    throw error;
  }
});

export async function createCategory(data: CreateCategoryInput) {
  try {
    const categoryService = new CategoryService();
    const response = await categoryService.create(data);
    revalidatePath("/categories");
    return response;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

export async function updateCategory(data: Category) {
  try {
    const categoryService = new CategoryService();
    const response = await categoryService.update(data);
    revalidatePath("/categories");
    return response;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

export async function deleteCategory(id: string) {
  try {
    const categoryService = new CategoryService();
    await categoryService.delete(id);
    revalidatePath("/categories");
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}
