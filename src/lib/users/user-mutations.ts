import { connectDB } from "@/lib/db/mongoose";
import { deleteSessionsForUser } from "@/lib/auth/session";
import User from "@/models/User";
import { countActiveAdmins, findUserByIdForAdmin } from "@/lib/users/user-queries";
import {
  verifyLastActiveAdmin,
  verifySelfDeactivation,
  verifySelfRoleChange,
} from "@/lib/users/verifyAdminSafety";
import {
  verifyArchitectDowngradeSafety,
} from "@/lib/users/verifyArchitectDowngrade";
import { verifyClientRoleChangeSafety } from "@/lib/users/verifyClientRoleChange";
import {
  verifyArchitectDeactivationSafety,
  verifyClientDeactivationSafety,
} from "@/lib/users/verifyDeactivationSafety";
import { ensureProfessionalProfile } from "@/lib/professionals/ensureProfessionalProfile";
import { UserMutationError } from "@/lib/users/user-errors";
import { normalizeUserRole } from "@/lib/auth/user-role";
import type { SafeUser, UserRole } from "@/types/user";

export async function updateUserRole(
  currentAdmin: SafeUser,
  userId: string,
  newRole: UserRole,
): Promise<void> {
  await connectDB();

  const targetUser = await findUserByIdForAdmin(userId);
  const normalizedCurrentRole = normalizeUserRole(targetUser.role);
  const target = {
    id: targetUser._id.toString(),
    role: normalizedCurrentRole,
    isActive: targetUser.isActive,
  };

  verifySelfRoleChange(currentAdmin, target, newRole);
  await verifyLastActiveAdmin(target, newRole, null, countActiveAdmins);
  await verifyArchitectDowngradeSafety(
    userId,
    targetUser.role,
    newRole,
  );
  await verifyClientRoleChangeSafety(
    userId,
    targetUser.role,
    newRole,
  );

  const updatePayload = {
    role: newRole,
    requestedRole: null,
  };

  const result = await User.updateOne({ _id: userId }, { $set: updatePayload });

  if (result.matchedCount === 0) {
    throw new UserMutationError("המשתמש לא נמצא.");
  }

  if (newRole === "architect") {
    await ensureProfessionalProfile(userId);
  }
}

export async function updateUserActiveStatus(
  currentAdmin: SafeUser,
  userId: string,
  isActive: boolean,
): Promise<void> {
  await connectDB();

  const targetUser = await findUserByIdForAdmin(userId);
  const target = {
    id: targetUser._id.toString(),
    role: normalizeUserRole(targetUser.role),
    isActive: targetUser.isActive,
  };

  verifySelfDeactivation(currentAdmin, target, isActive);
  await verifyLastActiveAdmin(target, null, isActive, countActiveAdmins);
  await verifyClientDeactivationSafety(
    userId,
    targetUser.role,
    isActive,
  );
  await verifyArchitectDeactivationSafety(
    userId,
    targetUser.role,
    isActive,
  );

  const result = await User.updateOne({ _id: userId }, { isActive });

  if (result.matchedCount === 0) {
    throw new UserMutationError("המשתמש לא נמצא.");
  }

  if (!isActive) {
    await deleteSessionsForUser(userId);
  }
}
