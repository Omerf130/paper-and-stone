import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { UserMutationError } from "@/lib/users/user-errors";
import { isClientRole, normalizeUserRole } from "@/lib/auth/user-role";
import type { StoredUserRole, UserRole } from "@/types/user";

export const CLIENT_ROLE_CHANGE_ERRORS = {
  ASSIGNED_TO_ACTIVE_PROJECT:
    "לא ניתן לשנות תפקיד לקוח המשויך לפרויקט פעיל.",
} as const;

export async function countActiveProjectsForClient(
  userId: string,
): Promise<number> {
  await connectDB();
  return Project.countDocuments({
    clientUserId: new Types.ObjectId(userId),
    onboardingStatus: "active",
  });
}

export async function verifyClientRoleChangeSafety(
  userId: string,
  currentRole: StoredUserRole,
  newRole: UserRole,
): Promise<void> {
  if (!isClientRole(currentRole) || newRole === "client") {
    return;
  }

  const assignedProjectCount = await countActiveProjectsForClient(userId);

  if (assignedProjectCount > 0) {
    throw new UserMutationError(CLIENT_ROLE_CHANGE_ERRORS.ASSIGNED_TO_ACTIVE_PROJECT);
  }
}

export function isClientStoredRole(role: StoredUserRole): boolean {
  return normalizeUserRole(role) === "client";
}
