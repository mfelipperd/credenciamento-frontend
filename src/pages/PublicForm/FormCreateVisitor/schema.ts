// src/schemas/credenciamento.schema.ts
import { isValidCNPJ } from "@/utils/isValidCnpj";
import { z } from "zod";

export const defaultVisitorCnpj = "29615037000106";

export const credenciamentoSchema = z
  .object({
    ingresso: z.enum(["lojista", "visitante"]),
    name: z.string().nonempty("Nome é obrigatório"),
    company: z.string().nonempty("Empresa é obrigatória"),
    email: z.string().email("Email inválido"),
    cnpj: z.string().length(18, "CNPJ deve conter 14 dígitos"),
    phone: z.string().nonempty("Telefone é obrigatório"),
    zipCode: z
      .string()
      .regex(
        /^\d{5}-?\d{3}$/,
        "CEP inválido, deve ser no formato 00000-000 ou 00000000"
      ),
    sectors: z.array(z.string()).optional(),
    howDidYouKnow: z.string().nonempty("Selecione uma opção"),
  })
  .superRefine((data, ctx) => {
    // Validação condicional de CNPJ
    if (data.ingresso === "visitante" && data.cnpj !== defaultVisitorCnpj) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cnpj"],
        message: `Visitante deve usar o CNPJ padrão ${defaultVisitorCnpj}`,
      });
    }
    if (data.ingresso === "lojista") {
      if (!isValidCNPJ(data.cnpj)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cnpj"],
          message: "CNPJ inválido segundo algoritmo",
        });
      }
    }
  });

export type CredenciamentoFormData = z.infer<typeof credenciamentoSchema>;
