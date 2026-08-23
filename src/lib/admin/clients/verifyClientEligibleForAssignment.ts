import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import { isClientRole, normalizeUserRole } from "@/lib/auth/user-role";
import { isUserAccountApproved } from "@/lib/users/account-status";
import { ProjectMutationError } from "@/lib/projects/project-errors";

export const CLIENT_ASSIGNMENT_ERRORS = {
  NOT_FOUND: "הלקוח לא נמצא.",
  NOT_ELIGIBLE: "ניתן להקצות רק לקוח פעיל.",
} as const;

export async function verifyClientEligibleForAssignment(
  clientUserId: string,
): Promise<{ id: string; fullName: string | null; email: string }> {
  await connectDB();

  if (!Types.ObjectId.isValid(clientUserId)) {
    throw new ProjectMutationError(CLIENT_ASSIGNMENT_ERRORS.NOT_FOUND);
  }

  const user = await User.findById(clientUserId);

  if (
    !user ||
    !user.isActive ||
    !isClientRole(user.role) ||
    !isUserAccountApproved(user)
  ) {
    throw new ProjectMutationError(CLIENT_ASSIGNMENT_ERRORS.NOT_ELIGIBLE);
  }

  return {
    id: user._id.toString(),
    fullName: user.fullName?.trim() ?? null,
    email: user.email,
  };
}

export function isEligibleClientRole(role: string): boolean {
  return normalizeUserRole(role as never) === "client";
}
