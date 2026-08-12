import { UserMutationError } from "@/lib/users/user-errors";
import type { UserRole } from "@/types/user";
import type { SafeUser } from "@/types/user";

export const SAFETY_ERRORS = {
  SELF_DEMOTION:
    "לא ניתן להסיר את תפקיד האדמין מהחשבון שלך.",
  SELF_DEACTIVATION: "לא ניתן להשבית את החשבון שלך.",
  LAST_ADMIN:
    "לא ניתן להסיר את האדמין הפעיל האחרון במערכת.",
} as const;

type TargetUser = {
  id: string;
  role: UserRole;
  isActive: boolean;
};

export function verifySelfRoleChange(
  currentAdmin: SafeUser,
  targetUser: TargetUser,
  newRole: UserRole,
): void {
  if (currentAdmin.id === targetUser.id && newRole !== "admin") {
    throw new UserMutationError(SAFETY_ERRORS.SELF_DEMOTION);
  }
}

export function verifySelfDeactivation(
  currentAdmin: SafeUser,
  targetUser: TargetUser,
  nextIsActive: boolean,
): void {
  if (currentAdmin.id === targetUser.id && !nextIsActive) {
    throw new UserMutationError(SAFETY_ERRORS.SELF_DEACTIVATION);
  }
}

export async function verifyLastActiveAdmin(
  targetUser: TargetUser,
  nextRole: UserRole | null,
  nextIsActive: boolean | null,
  countActiveAdmins: () => Promise<number>,
): Promise<void> {
  const isCurrentlyActiveAdmin =
    targetUser.role === "admin" && targetUser.isActive;

  if (!isCurrentlyActiveAdmin) {
    return;
  }

  const willRemainActiveAdmin =
    (nextRole ?? targetUser.role) === "admin" &&
    (nextIsActive ?? targetUser.isActive);

  if (willRemainActiveAdmin) {
    return;
  }

  const activeAdminCount = await countActiveAdmins();

  if (activeAdminCount <= 1) {
    throw new UserMutationError(SAFETY_ERRORS.LAST_ADMIN);
  }
}
