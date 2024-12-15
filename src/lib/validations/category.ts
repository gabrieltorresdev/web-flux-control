import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  type: z.enum(["income", "expense"]),
});

export const categoryInputSchema = categorySchema.omit({
  id: true,
});

export const categoryArraySchema = z.array(categorySchema);

export type CategorySchema = z.infer<typeof categorySchema>;
export type CategoryInputSchema = z.infer<typeof categoryInputSchema>;
