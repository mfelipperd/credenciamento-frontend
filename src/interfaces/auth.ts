import type { User } from "./user";

export interface AuthResponse {
  access_token: string;
  user: User;
}
