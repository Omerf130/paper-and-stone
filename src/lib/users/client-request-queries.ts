import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import { CLIENT_ROLE_FILTER } from "@/lib/auth/user-role";
import { mapLeanUserToClientRequestListItem } from "@/lib/users/mapUserToAdminListItem";
import type { ClientRequestListItem } from "@/types/admin-user";

export const PENDING_PLAIN_CLIENT_REQUEST_FILTER = {
  role: CLIENT_ROLE_FILTER,
  requestedRole: null,
  accountStatus: "pending" as const,
  isActive: true,
};

export async function countPendingClientRequests(): Promise<number> {
  await connectDB();
  return User.countDocuments(PENDING_PLAIN_CLIENT_REQUEST_FILTER);
}

export async function getPendingClientRequests(): Promise<ClientRequestListItem[]> {
  await connectDB();

  const users = await User.find(PENDING_PLAIN_CLIENT_REQUEST_FILTER)
    .sort({ createdAt: -1 })
    .lean();

  return users.map((user) =>
    mapLeanUserToClientRequestListItem({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      identificationNumber: user.identificationNumber,
      role: user.role,
      requestedRole: user.requestedRole ?? null,
      accountStatus: user.accountStatus ?? "pending",
      isActive: user.isActive,
      createdAt: user.createdAt,
    }),
  );
}
