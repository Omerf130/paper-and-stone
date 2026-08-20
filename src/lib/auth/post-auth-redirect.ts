import type { UserRole } from "@/types/user";

export function resolvePostAuthRedirect(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "architect":
      return "/professional";
    case "client":
      return "/client";
    default:
      return "/";
  }
}
