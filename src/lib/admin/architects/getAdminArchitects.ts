import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { escapeRegex } from "@/lib/catalog/escape-regex";
import { calculatePagination } from "@/lib/catalog/catalog-pagination";
import { ARCHITECT_ROLE_FILTER } from "@/lib/auth/user-role";
import User from "@/models/User";
import ProfessionalProfile from "@/models/ProfessionalProfile";
import { mapLeanUserToAdminListItem } from "@/lib/users/mapUserToAdminListItem";
import { countProjectsForArchitect } from "@/lib/admin/crm/getAdminCrmProjects";
import { ensureProfessionalProfile } from "@/lib/professionals/ensureProfessionalProfile";
import { getProfileCompletenessSummary } from "@/lib/professionals/profile-completeness";
import {
  CRM_PAGE_SIZE,
  type AdminArchitectsParams,
} from "@/lib/admin/crm/crm-params";
import type {
  AdminArchitectDetailView,
  AdminArchitectsPageResult,
} from "@/types/admin-crm";

export function buildAdminArchitectsFilter(params: AdminArchitectsParams) {
  const filter: Record<string, unknown> = {
    role: ARCHITECT_ROLE_FILTER,
  };

  if (params.query) {
    const regex = escapeRegex(params.query);
    filter.$or = [
      { email: { $regex: regex, $options: "i" } },
      { fullName: { $regex: regex, $options: "i" } },
      { identificationNumber: { $regex: regex, $options: "i" } },
    ];
  }

  if (params.status === "active") {
    filter.isActive = true;
  } else if (params.status === "inactive") {
    filter.isActive = false;
  }

  return filter;
}

export async function getAdminArchitects(
  params: AdminArchitectsParams,
): Promise<AdminArchitectsPageResult> {
  await connectDB();

  const filter = buildAdminArchitectsFilter(params);
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

  const userIds = users.map((user) => user._id);
  const profiles = await ProfessionalProfile.find({
    userId: { $in: userIds },
  }).lean();

  const profileByUserId = new Map(
    profiles.map((profile) => [profile.userId.toString(), profile]),
  );

  const architects = await Promise.all(
    users.map(async (user) => {
      const mapped = mapLeanUserToAdminListItem(user);
      const profile = profileByUserId.get(mapped.id);
      const profileView = profile
        ? {
            fullName: profile.fullName ?? undefined,
            phone: profile.phone ?? undefined,
            companyName: profile.companyName ?? undefined,
            city: profile.city ?? undefined,
            bio: profile.bio ?? undefined,
          }
        : {
            fullName: undefined,
            phone: undefined,
            companyName: undefined,
            city: undefined,
            bio: undefined,
          };
      const completeness = getProfileCompletenessSummary(profileView);
      const projectCount = await countProjectsForArchitect(mapped.id);

      return {
        id: mapped.id,
        email: mapped.email,
        fullName: profile?.fullName?.trim() || mapped.fullName,
        identificationNumber: mapped.identificationNumber,
        companyName: profile?.companyName?.trim() ?? null,
        phone: profile?.phone?.trim() ?? null,
        isActive: mapped.isActive,
        projectCount,
        profileFilledCount: completeness.filledCount,
        profileTotalCount: completeness.totalCount,
        createdAt: mapped.createdAt,
        updatedAt: mapped.updatedAt,
      };
    }),
  );

  return {
    architects,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
  };
}

export async function getAdminArchitectDetail(
  architectUserId: string,
): Promise<AdminArchitectDetailView | null> {
  await connectDB();

  if (!Types.ObjectId.isValid(architectUserId)) {
    return null;
  }

  const user = await User.findOne({
    _id: new Types.ObjectId(architectUserId),
    role: ARCHITECT_ROLE_FILTER,
  }).lean();

  if (!user) {
    return null;
  }

  const mapped = mapLeanUserToAdminListItem(user);
  const profile = await ensureProfessionalProfile(mapped.id);
  const completeness = getProfileCompletenessSummary(profile);
  const projectCount = await countProjectsForArchitect(mapped.id);

  return {
    id: mapped.id,
    email: mapped.email,
    fullName: profile.fullName?.trim() || mapped.fullName,
    identificationNumber: mapped.identificationNumber,
    isActive: mapped.isActive,
    projectCount,
    createdAt: mapped.createdAt,
    updatedAt: mapped.updatedAt,
    profile,
    profileMissingFields: completeness.missingFields,
  };
}
