import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import type { SafeUser, StoredUserRole } from "@/types/user";
import { normalizeAccountStatus } from "@/lib/users/account-status";
import { normalizeUserRole } from "./user-role";
import { readSessionTokenFromCookie, findValidSessionByToken } from "./session";

export function toSafeUser(user: {
  _id: { toString(): string };
  email: string;
  role: StoredUserRole;
  isActive: boolean;
  accountStatus?: import("@/lib/users/account-status").AccountStatus | null;
  requestedRole?: import("@/types/user").RequestedRole | null;
}): SafeUser | null {
  if (!user.isActive) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: normalizeUserRole(user.role),
    accountStatus: normalizeAccountStatus(user.accountStatus),
    requestedRole: user.requestedRole ?? null,
  };
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const rawToken = await readSessionTokenFromCookie();
  if (!rawToken) {
    return null;
  }

  const session = await findValidSessionByToken(rawToken);
  if (!session) {
    return null;
  }

  await connectDB();
  const user = await User.findById(session.userId);

  if (!user) {
    return null;
  }

  return toSafeUser(user);
}
