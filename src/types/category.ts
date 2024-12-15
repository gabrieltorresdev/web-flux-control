import { z } from "zod";
import {
  categorySchema,
  categoryInputSchema,
} from "@/lib/validations/category";

export type Category = z.infer<typeof categorySchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
