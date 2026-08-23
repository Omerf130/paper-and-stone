import type { AccountStatus, RequestedRole, UserRole } from "@/types/user";
import { normalizeAccountStatus } from "@/lib/users/account-status";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";

export function resolvePostAuthDestination(input: {
  role: UserRole;
  accountStatus?: AccountStatus | null;
}): string {
  const accountStatus = normalizeAccountStatus(input.accountStatus);

  if (accountStatus === "pending" || accountStatus === "rejected") {
    return "/account/status";
  }

  return resolvePostAuthRedirect(input.role);
}

export function canAccessClientWorkspace(user: {
  role: UserRole;
  accountStatus?: AccountStatus | null;
  isActive?: boolean;
}): boolean {
  return (
    user.role === "client" &&
    user.isActive !== false &&
    normalizeAccountStatus(user.accountStatus) === "approved"
  );
}

export function canAccessArchitectWorkspace(user: {
  role: UserRole;
  accountStatus?: AccountStatus | null;
  isActive?: boolean;
}): boolean {
  return (
    user.role === "architect" &&
    user.isActive !== false &&
    normalizeAccountStatus(user.accountStatus) === "approved"
  );
}

export function isArchitectApplicant(user: {
  role: UserRole;
  requestedRole?: RequestedRole | null;
  accountStatus?: AccountStatus | null;
}): boolean {
  return (
    user.role === "client" &&
    user.requestedRole === "architect" &&
    normalizeAccountStatus(user.accountStatus) === "pending"
  );
}

export function isPlainClientApplicant(user: {
  role: UserRole;
  requestedRole?: RequestedRole | null;
  accountStatus?: AccountStatus | null;
}): boolean {
  return (
    user.role === "client" &&
    user.requestedRole == null &&
    normalizeAccountStatus(user.accountStatus) === "pending"
  );
}
