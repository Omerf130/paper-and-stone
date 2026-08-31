import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { escapeRegex } from "@/lib/catalog/escape-regex";
import { calculatePagination } from "@/lib/catalog/catalog-pagination";
import { CLIENT_ROLE_FILTER } from "@/lib/auth/user-role";
import User from "@/models/User";
import { normalizeAccountStatus } from "@/lib/users/account-status";
import { mapLeanUserToAdminListItem } from "@/lib/users/mapUserToAdminListItem";
import { countProjectsForClient } from "@/lib/admin/crm/getAdminCrmProjects";
import {
  CRM_PAGE_SIZE,
  type AdminClientsParams,
} from "@/lib/admin/crm/crm-params";
import type {
  AdminClientDetailView,
  AdminClientsPageResult,
} from "@/types/admin-crm";

export function buildAdminClientsFilter(params: AdminClientsParams) {
  const filter: Record<string, unknown> = {
    role: CLIENT_ROLE_FILTER,
    requestedRole: { $ne: "architect" },
  };

  if (params.query) {
    const regex = escapeRegex(params.query);
    filter.$or = [
      { email: { $regex: regex, $options: "i" } },
      { fullName: { $regex: regex, $options: "i" } },
      { identificationNumber: { $regex: regex, $options: "i" } },
    ];
  }

  if (params.accountStatus) {
    filter.accountStatus = params.accountStatus;
  }

  if (params.status === "active") {
    filter.isActive = true;
  } else if (params.status === "inactive") {
    filter.isActive = false;
  }

  return filter;
}

export async function getAdminClients(
  params: AdminClientsParams,
): Promise<AdminClientsPageResult> {
  await connectDB();

  const filter = buildAdminClientsFilter(params);
  const total = await User.countDocuments(filter);
  const pagination = calculatePagination({
    total,
    page: params.page,
    pageSize: CRM_PAGE_SIZE,
  });

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(pagination.skip)
    .limit(pagination.pageSize)
    .lean();

  const clients = await Promise.all(
    users.map(async (user) => {
      const mapped = mapLeanUserToAdminListItem(user);
      const projectCount = await countProjectsForClient(mapped.id);
      return {
        id: mapped.id,
        email: mapped.email,
        fullName: mapped.fullName,
        identificationNumber: mapped.identificationNumber,
        accountStatus: mapped.accountStatus,
        isActive: mapped.isActive,
        projectCount,
        createdAt: mapped.createdAt,
        updatedAt: mapped.updatedAt,
      };
    }),
  );

  return {
    clients,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
  };
}

export async function getAdminClientDetail(
  clientUserId: string,
): Promise<AdminClientDetailView | null> {
  await connectDB();

  if (!Types.ObjectId.isValid(clientUserId)) {
    return null;
  }

  const user = await User.findOne({
    _id: new Types.ObjectId(clientUserId),
    role: CLIENT_ROLE_FILTER,
    requestedRole: { $ne: "architect" },
  }).lean();

  if (!user) {
    return null;
  }

  const mapped = mapLeanUserToAdminListItem(user);
  const projectCount = await countProjectsForClient(mapped.id);

  return {
    id: mapped.id,
    email: mapped.email,
    fullName: mapped.fullName,
    identificationNumber: mapped.identificationNumber,
    accountStatus: normalizeAccountStatus(user.accountStatus),
    isActive: mapped.isActive,
    projectCount,
    createdAt: mapped.createdAt,
    updatedAt: mapped.updatedAt,
  };
}
