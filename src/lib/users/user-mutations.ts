import { connectDB } from "@/lib/db/mongoose";
import { deleteSessionsForUser } from "@/lib/auth/session";
import User from "@/models/User";
import { countActiveAdmins, findUserByIdForAdmin } from "@/lib/users/user-queries";
import {
  verifyLastActiveAdmin,
  verifySelfDeactivation,
  verifySelfRoleChange,
} from "@/lib/users/verifyAdminSafety";
import { UserMutationError } from "@/lib/users/user-errors";
import type { SafeUser, UserRole } from "@/types/user";

export async function updateUserRole(
  currentAdmin: SafeUser,
  userId: string,
  newRole: UserRole,
): Promise<void> {
  await connectDB();

  const targetUser = await findUserByIdForAdmin(userId);
  const target = {
    id: targetUser._id.toString(),
    role: targetUser.role,
    isActive: targetUser.isActive,
  };

  verifySelfRoleChange(currentAdmin, target, newRole);
  await verifyLastActiveAdmin(target, newRole, null, countActiveAdmins);

  const result = await User.updateOne({ _id: userId }, { role: newRole });

  if (result.matchedCount === 0) {
    throw new UserMutationError("המשתמש לא נמצא.");
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
    role: targetUser.role,
    isActive: targetUser.isActive,
  };

  verifySelfDeactivation(currentAdmin, target, isActive);
  await verifyLastActiveAdmin(target, null, isActive, countActiveAdmins);

  const result = await User.updateOne({ _id: userId }, { isActive });

  if (result.matchedCount === 0) {
    throw new UserMutationError("המשתמש לא נמצא.");
  }

  if (!isActive) {
    await deleteSessionsForUser(userId);
  }
}
