import { z } from "zod";

export const transactionSchema = z.object({
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(100, "O título deve ter no máximo 100 caracteres"),
  amount: z
    .number()
    .min(0.01, "O valor deve ser maior que zero")
    .max(1000000, "O valor deve ser menor que 1.000.000"),
  category: z.string(),
  type: z.enum(["income", "expense"], {
    required_error: "Selecione o tipo da transação",
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;