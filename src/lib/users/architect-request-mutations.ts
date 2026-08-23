import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import ProfessionalProfile from "@/models/ProfessionalProfile";
import { isArchitectRole, isClientRole, normalizeUserRole } from "@/lib/auth/user-role";
import { ensureProfessionalProfile } from "@/lib/professionals/ensureProfessionalProfile";
import { UserMutationError } from "@/lib/users/user-errors";
import { USER_ERRORS } from "@/lib/users/user-validation";
import type { SafeUser } from "@/types/user";

export const ARCHITECT_REQUEST_ERRORS = {
  NOT_FOUND: "המשתמש לא נמצא.",
  NOT_PENDING:
    "המשתמש אינו ממתין לאישור הרשאת אדריכל.",
  INACTIVE: "לא ניתן לטפל בחשבון לא פעיל.",
} as const;

async function findPendingArchitectRequestUser(userId: string) {
  await connectDB();

  const user = await User.findById(userId);

  if (!user) {
    throw new UserMutationError(ARCHITECT_REQUEST_ERRORS.NOT_FOUND);
  }

  if (!user.isActive) {
    throw new UserMutationError(ARCHITECT_REQUEST_ERRORS.INACTIVE);
  }

  if (
    !isClientRole(user.role) ||
    user.requestedRole !== "architect"
  ) {
    throw new UserMutationError(ARCHITECT_REQUEST_ERRORS.NOT_PENDING);
  }

  return user;
}

async function seedProfessionalProfileFullName(
  userId: string,
  fullName?: string | null,
): Promise<void> {
  if (!fullName?.trim()) {
    return;
  }

  await ProfessionalProfile.updateOne(
    {
      userId: new Types.ObjectId(userId),
      $or: [{ fullName: { $exists: false } }, { fullName: null }, { fullName: "" }],
    },
    { $set: { fullName: fullName.trim() } },
  );
}

export async function approveArchitectRequest(
  _admin: SafeUser,
  userId: string,
): Promise<void> {
  const user = await findPendingArchitectRequestUser(userId);

  if (isArchitectRole(user.role) && user.requestedRole === null) {
    return;
  }

  const result = await User.updateOne(
    { _id: userId },
    { $set: { role: "architect", requestedRole: null, accountStatus: "approved" } },
  );

  if (result.matchedCount === 0) {
    throw new UserMutationError(USER_ERRORS.NOT_FOUND);
  }

  await ensureProfessionalProfile(userId);
  await seedProfessionalProfileFullName(userId, user.fullName);
}

export async function declineArchitectRequest(
  _admin: SafeUser,
  userId: string,
): Promise<void> {
  const user = await findPendingArchitectRequestUser(userId);

  const result = await User.updateOne(
    { _id: userId },
    {
      $set: {
        requestedRole: null,
        role: normalizeUserRole(user.role) === "client" ? "client" : user.role,
        accountStatus: "rejected",
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new UserMutationError(USER_ERRORS.NOT_FOUND);
  }
}
