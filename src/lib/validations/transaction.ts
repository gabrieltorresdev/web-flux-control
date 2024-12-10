import { z } from "zod";
import { CATEGORIES } from "@/types/transaction";

export const transactionSchema = z.object({
  description: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres")
    .max(100, "A descrição deve ter no máximo 100 caracteres"),
  amount: z
    .number()
    .min(0.01, "O valor deve ser maior que zero")
    .max(1000000, "O valor deve ser menor que 1.000.000"),
  category: z.string().refine((val) => Object.keys(CATEGORIES).includes(val), {
    message: "Categoria inválida",
  }),
  type: z.enum(["income", "expense"], {
    required_error: "Selecione o tipo da transação",
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
