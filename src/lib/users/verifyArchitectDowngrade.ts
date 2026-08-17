import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { UserMutationError } from "@/lib/users/user-errors";
import { isArchitectRole, normalizeUserRole } from "@/lib/auth/user-role";
import type { StoredUserRole, UserRole } from "@/types/user";

export const DOWNGRADE_ERRORS = {
  OWNS_PROJECTS:
    "לא ניתן להוריד ללקוח אדריכל שבבעלותו פרויקטים במערכת.",
} as const;

export async function countOwnedProjects(userId: string): Promise<number> {
  await connectDB();
  return Project.countDocuments({
    ownerUserId: new Types.ObjectId(userId),
  });
}

export async function verifyArchitectDowngradeSafety(
  userId: string,
  currentRole: StoredUserRole,
  newRole: UserRole,
): Promise<void> {
  if (!isArchitectRole(currentRole) || newRole !== "client") {
    return;
  }

  const ownedProjectCount = await countOwnedProjects(userId);

  if (ownedProjectCount > 0) {
    throw new UserMutationError(DOWNGRADE_ERRORS.OWNS_PROJECTS);
  }
}

export function buildRoleUpdatePayload(newRole: UserRole): {
  role: UserRole;
  requestedRole: null;
} {
  return {
    role: newRole,
    requestedRole: null,
  };
}

export function normalizeStoredRoleForUpdate(role: StoredUserRole): UserRole {
  return normalizeUserRole(role);
}
