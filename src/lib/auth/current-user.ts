import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import type { SafeUser, StoredUserRole } from "@/types/user";
import { normalizeUserRole } from "./user-role";
import { readSessionTokenFromCookie, findValidSessionByToken } from "./session";

export function toSafeUser(user: {
  _id: { toString(): string };
  email: string;
  role: StoredUserRole;
  isActive: boolean;
}): SafeUser | null {
  if (!user.isActive) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: normalizeUserRole(user.role),
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
