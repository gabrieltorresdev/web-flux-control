import { z } from "zod";

export class StorageUtils {
  static get<T>(key: string, schema: z.ZodType<T>): T | null {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return schema.parse(parsed);
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error);
      return null;
    }
  }

  static set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage (${key}):`, error);
      throw new Error("Failed to save data to storage");
    }
  }
}