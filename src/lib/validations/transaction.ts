import { z } from "zod";

export const transactionSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  amount: z.number().min(0.01, "O valor deve ser maior que zero"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  dateTime: z.date({
    required_error: "Selecione uma data",
    invalid_type_error: "Data inválida",
  }),
});
