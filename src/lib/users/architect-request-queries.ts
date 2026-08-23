import { connectDB } from "@/lib/db/mongoose";
import { CLIENT_ROLE_FILTER } from "@/lib/auth/user-role";
import User from "@/models/User";
import { mapLeanUserToArchitectRequestListItem } from "@/lib/users/mapUserToAdminListItem";
import type { ArchitectRequestListItem } from "@/types/admin-user";

const PENDING_ARCHITECT_REQUEST_FILTER = {
  role: CLIENT_ROLE_FILTER,
  requestedRole: "architect" as const,
  accountStatus: "pending" as const,
  isActive: true,
};

export async function countPendingArchitectRequests(): Promise<number> {
  await connectDB();
  return User.countDocuments(PENDING_ARCHITECT_REQUEST_FILTER);
}

export async function getPendingArchitectRequests(): Promise<
  ArchitectRequestListItem[]
> {
  await connectDB();

  const users = await User.find(PENDING_ARCHITECT_REQUEST_FILTER)
    .sort({ createdAt: -1 })
    .lean();

  return users.map((user) =>
    mapLeanUserToArchitectRequestListItem({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      identificationNumber: user.identificationNumber,
      role: user.role,
      requestedRole: "architect",
      isActive: user.isActive,
      createdAt: user.createdAt,
    }),
  );
}
