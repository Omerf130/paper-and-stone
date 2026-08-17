export type UserRole = "client" | "architect" | "admin";

export type StoredUserRole = UserRole | "customer" | "professional";

export type RequestedRole = "architect" | null;

export type SafeUser = {
  id: string;
  email: string;
  role: UserRole;
};
