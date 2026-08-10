export type UserRole = "customer" | "professional" | "admin";

export type SafeUser = {
  id: string;
  email: string;
  role: UserRole;
};
