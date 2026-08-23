export type UserRole = "client" | "architect" | "admin";

export type StoredUserRole = UserRole | "customer" | "professional";

export type RequestedRole = "architect" | null;

export type { AccountStatus } from "@/lib/users/account-status";

export type SafeUser = {
  id: string;
  email: string;
  role: UserRole;
  accountStatus: import("@/lib/users/account-status").AccountStatus;
  requestedRole: RequestedRole;
};
