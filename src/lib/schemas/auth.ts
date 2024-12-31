import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O email é obrigatório")
    .email("Digite um email válido"),
  password: z
    .string()
    .min(1, "A senha é obrigatória")
    .min(8, "A senha deve ter pelo menos 8 caracteres"),
});
