import type { EUserRole } from "@/enums/user.enum";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

/**
 * Interface representing the data required to create a new user.
 */
export interface ICreateUserInput {
  /**
   * Full name of the user (max. 255 characters).
   */
  name: string;

  /**
   * Valid email address of the user.
   */
  email: string;

  /**
   * Password for the user (8–255 characters).
   */
  password: string;

  /**
   * Role assigned to the user.
   */
  role: EUserRole;
}
