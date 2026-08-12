import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import { UserMutationError } from "@/lib/users/user-errors";
import { USER_ERRORS } from "@/lib/users/user-validation";
import type { IUser } from "@/models/User";

export async function countActiveAdmins(): Promise<number> {
  await connectDB();
  return User.countDocuments({ role: "admin", isActive: true });
}

export async function findUserByIdForAdmin(userId: string): Promise<IUser> {
  await connectDB();

  const user = await User.findById(userId);

  if (!user) {
    throw new UserMutationError(USER_ERRORS.NOT_FOUND);
  }

  return user;
}
