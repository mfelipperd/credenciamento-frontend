export const EUserRole = {
  ADMIN: "admin",
  RECEPTIONIST: "receptionist",
  CONSULTANT: "consultant",
} as const;

export type EUserRole = (typeof EUserRole)[keyof typeof EUserRole];
