import { UserMutationError } from "@/lib/users/user-errors";
import { countActiveProjectsForClient } from "@/lib/users/verifyClientRoleChange";
import { countOwnedProjects } from "@/lib/users/verifyArchitectDowngrade";
import { CRM_ERRORS } from "@/types/admin-crm";
import { isClientStoredRole } from "@/lib/users/verifyClientRoleChange";
import { isArchitectRole } from "@/lib/auth/user-role";
import type { StoredUserRole } from "@/types/user";

export async function verifyClientDeactivationSafety(
  userId: string,
  role: StoredUserRole,
  isActive: boolean,
): Promise<void> {
  if (isActive || !isClientStoredRole(role)) {
    return;
  }

  const assignedProjectCount = await countActiveProjectsForClient(userId);
  if (assignedProjectCount > 0) {
    throw new UserMutationError(CRM_ERRORS.DEACTIVATE_CLIENT_ASSIGNED);
  }
}

export async function verifyArchitectDeactivationSafety(
  userId: string,
  role: StoredUserRole,
  isActive: boolean,
): Promise<void> {
  if (isActive || !isArchitectRole(role)) {
    return;
  }

  const ownedProjectCount = await countOwnedProjects(userId);
  if (ownedProjectCount > 0) {
    throw new UserMutationError(CRM_ERRORS.DEACTIVATE_ARCHITECT_OWNS);
  }
}
