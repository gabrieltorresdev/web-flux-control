"use server";

import { CategoryService } from "@/features/categories/services/category-service";
import { CreateCategoryInput, Category } from "@/features/categories/types";
import { revalidatePath } from "next/cache";

export async function getCategories(searchTerm?: string) {
  try {
    const categoryService = new CategoryService();
    return await categoryService.findAllPaginated(searchTerm);
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

export async function getCategoryById(id: string) {
  try {
    const categoryService = new CategoryService();
    return await categoryService.findById(id);
  } catch (error) {
    console.error("Error fetching category by id:", error);
    throw error;
  }
}

export async function getCategoryByName(name: string) {
  try {
    const categoryService = new CategoryService();
    return await categoryService.findByName(name);
  } catch (error) {
    console.error("Error fetching category by name:", error);
    throw error;
  }
}

export async function createCategory(data: CreateCategoryInput) {
  try {
    const categoryService = new CategoryService();
    const response = await categoryService.create(data);
    // Revalidate all paths that might use the category
    revalidatePath("/categories");
    revalidatePath(`/categories/by-name/${data.name}`);
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
