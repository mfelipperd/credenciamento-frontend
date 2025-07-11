import { z } from "zod";

export const defaultVisitorCnpj = "29615037000106";

export const credenciamentoSchema = z.object({
  ingresso: z.enum(["lojista", "representante-comercial"]),
  name: z.string().nonempty("Nome é obrigatório"),
  company: z.string().nonempty("Empresa é obrigatória"),
  email: z.string().email("Email inválido"),
  cnpj: z.string().length(18, "CNPJ deve conter 14 dígitos").optional(),
  phone: z
    .string()
    .nonempty("Telefone é obrigatório")
    .length(15, "Telefone deve conter 11 dígitos"),
  zipCode: z
    .string()
    .regex(
      /^\d{5}-?\d{3}$/,
      "CEP inválido, deve ser no formato 00000-000 ou 00000000"
    ),
  sectors: z.array(z.string()).optional(),
  howDidYouKnow: z.string().nonempty("Selecione uma opção"),
  visitors: z.array(z.string()).optional(),
});

export type CredenciamentoFormData = z.infer<typeof credenciamentoSchema>;
