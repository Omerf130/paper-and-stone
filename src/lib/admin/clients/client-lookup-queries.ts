import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { escapeRegex } from "@/lib/catalog/escape-regex";
import { CLIENT_ROLE_FILTER } from "@/lib/auth/user-role";
import { APPROVED_OR_LEGACY_ACCOUNT_STATUS_FILTER } from "@/lib/users/account-status";
import User from "@/models/User";

export type ClientLookupItem = {
  id: string;
  fullName: string | null;
  email: string;
};

const CLIENT_LOOKUP_LIMIT = 50;

const ACTIVE_CLIENT_FILTER = {
  role: CLIENT_ROLE_FILTER,
  isActive: true,
  ...APPROVED_OR_LEGACY_ACCOUNT_STATUS_FILTER,
};

export function buildClientSearchFilter(query: string | null | undefined) {
  const trimmed = query?.trim();

  if (!trimmed) {
    return ACTIVE_CLIENT_FILTER;
  }

  const regex = escapeRegex(trimmed);

  return {
    ...ACTIVE_CLIENT_FILTER,
    $or: [
      { email: { $regex: regex, $options: "i" } },
      { fullName: { $regex: regex, $options: "i" } },
      { identificationNumber: { $regex: regex, $options: "i" } },
    ],
  };
}

export async function searchClientsForAdmin(
  query: string | null | undefined,
): Promise<ClientLookupItem[]> {
  await connectDB();

  const users = await User.find(buildClientSearchFilter(query))
    .sort({ fullName: 1, email: 1 })
    .limit(CLIENT_LOOKUP_LIMIT)
    .select("_id email fullName")
    .lean();

  return users.map((user) => ({
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName?.trim() ?? null,
  }));
}

export async function findClientByIdForAdmin(
  clientUserId: string,
): Promise<ClientLookupItem | null> {
  await connectDB();

  if (!Types.ObjectId.isValid(clientUserId)) {
    return null;
  }

  const user = await User.findOne({
    _id: new Types.ObjectId(clientUserId),
    ...ACTIVE_CLIENT_FILTER,
  })
    .select("_id email fullName isActive")
    .lean();

  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName?.trim() ?? null,
  };
}

export async function resolveAssignedClientFullName(
  clientUserId?: Types.ObjectId | string | null,
): Promise<string | null> {
  if (!clientUserId) {
    return null;
  }

  await connectDB();

  const user = await User.findById(clientUserId).select("fullName email").lean();

  if (!user) {
    return null;
  }

  return user.fullName?.trim() || user.email;
}
