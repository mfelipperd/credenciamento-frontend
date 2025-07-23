import { EUserRole } from "@/enums/user.enum";
import { z } from "zod";

/**
 * Zod schema for creating a new user.
 * Only essential fields are required; extras are passed through.
 */
export const createUserSchema = z
  .object({
    /** Full name (max 255 chars) */
    name: z.string().nonempty({ message: "Name is required" }).max(255),

    /** Valid email address */
    email: z.string().nonempty({ message: "Email is required" }).email(),

    /** Password (8–255 chars) */
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(255),

    /** User role, defaults to USER if not provided */
    role: z.nativeEnum(EUserRole).optional().default(EUserRole.RECEPTIONIST),
  })
  // Allow additional, non-validated fields
  .passthrough();

/** Type inferred from schema */
export type CreateUserInput = z.infer<typeof createUserSchema>;
