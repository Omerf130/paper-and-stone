import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import { isClientRole, normalizeUserRole } from "@/lib/auth/user-role";
import { UserMutationError } from "@/lib/users/user-errors";
import { USER_ERRORS } from "@/lib/users/user-validation";
import type { SafeUser } from "@/types/user";
import { isPlainClientApplicant } from "@/lib/auth/account-access";

export const CLIENT_REQUEST_ERRORS = {
  NOT_FOUND: "המשתמש לא נמצא.",
  NOT_PENDING: "המשתמש אינו ממתין לאישור הרשמת לקוח.",
  INACTIVE: "לא ניתן לטפל בחשבון לא פעיל.",
} as const;

async function findPendingPlainClientRequestUser(userId: string) {
  await connectDB();

  const user = await User.findById(userId);

  if (!user) {
    throw new UserMutationError(CLIENT_REQUEST_ERRORS.NOT_FOUND);
  }

  if (!user.isActive) {
    throw new UserMutationError(CLIENT_REQUEST_ERRORS.INACTIVE);
  }

  if (
    !isPlainClientApplicant({
      role: normalizeUserRole(user.role),
      requestedRole: user.requestedRole ?? null,
      accountStatus: user.accountStatus,
    })
  ) {
    throw new UserMutationError(CLIENT_REQUEST_ERRORS.NOT_PENDING);
  }

  return user;
}

export async function approveClientAccount(
  _admin: SafeUser,
  userId: string,
): Promise<void> {
  const user = await findPendingPlainClientRequestUser(userId);

  if (!isClientRole(user.role)) {
    throw new UserMutationError(CLIENT_REQUEST_ERRORS.NOT_PENDING);
  }

  const result = await User.updateOne(
    { _id: userId },
    { $set: { accountStatus: "approved" } },
  );

  if (result.matchedCount === 0) {
    throw new UserMutationError(USER_ERRORS.NOT_FOUND);
  }
}

export async function rejectClientAccount(
  _admin: SafeUser,
  userId: string,
): Promise<void> {
  await findPendingPlainClientRequestUser(userId);

  const result = await User.updateOne(
    { _id: userId },
    { $set: { accountStatus: "rejected" } },
  );

  if (result.matchedCount === 0) {
    throw new UserMutationError(USER_ERRORS.NOT_FOUND);
  }
}
