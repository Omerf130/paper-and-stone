import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { escapeRegex } from "@/lib/catalog/escape-regex";
import { ARCHITECT_ROLE_FILTER } from "@/lib/auth/user-role";
import { APPROVED_OR_LEGACY_ACCOUNT_STATUS_FILTER } from "@/lib/users/account-status";
import User from "@/models/User";
import ProfessionalProfile from "@/models/ProfessionalProfile";
import { getProfileCompletenessSummary } from "@/lib/professionals/profile-completeness";
import { mapProfessionalProfileToView } from "@/lib/professionals/mapProfessionalProfileToView";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { CRM_ERRORS } from "@/types/admin-crm";

export type ArchitectLookupItem = {
  id: string;
  fullName: string | null;
  email: string;
  companyName?: string | null;
};

const ARCHITECT_LOOKUP_LIMIT = 50;

const ELIGIBLE_ARCHITECT_FILTER = {
  role: ARCHITECT_ROLE_FILTER,
  isActive: true,
  ...APPROVED_OR_LEGACY_ACCOUNT_STATUS_FILTER,
};

export function buildArchitectSearchFilter(query: string | null | undefined) {
  const trimmed = query?.trim();

  if (!trimmed) {
    return ELIGIBLE_ARCHITECT_FILTER;
  }

  const regex = escapeRegex(trimmed);

  return {
    ...ELIGIBLE_ARCHITECT_FILTER,
    $or: [
      { email: { $regex: regex, $options: "i" } },
      { fullName: { $regex: regex, $options: "i" } },
      { identificationNumber: { $regex: regex, $options: "i" } },
    ],
  };
}

export async function searchArchitectsForAdmin(
  query: string | null | undefined,
): Promise<ArchitectLookupItem[]> {
  await connectDB();

  const users = await User.find(buildArchitectSearchFilter(query))
    .sort({ fullName: 1, email: 1 })
    .limit(ARCHITECT_LOOKUP_LIMIT)
    .select("_id email fullName")
    .lean();

  const userIds = users.map((user) => user._id);
  const profiles = await ProfessionalProfile.find({
    userId: { $in: userIds },
  })
    .select("userId fullName companyName")
    .lean();

  const profileByUserId = new Map(
    profiles.map((profile) => [profile.userId.toString(), profile]),
  );

  return users.map((user) => {
    const profile = profileByUserId.get(user._id.toString());
    return {
      id: user._id.toString(),
      email: user.email,
      fullName: profile?.fullName?.trim() || user.fullName?.trim() || null,
      companyName: profile?.companyName?.trim() ?? null,
    };
  });
}

export async function findArchitectByIdForAdmin(
  architectUserId: string,
): Promise<ArchitectLookupItem | null> {
  await connectDB();

  if (!Types.ObjectId.isValid(architectUserId)) {
    return null;
  }

  const user = await User.findOne({
    _id: new Types.ObjectId(architectUserId),
    ...ELIGIBLE_ARCHITECT_FILTER,
  })
    .select("_id email fullName")
    .lean();

  if (!user) {
    return null;
  }

  const profile = await ProfessionalProfile.findOne({
    userId: user._id,
  })
    .select("fullName companyName")
    .lean();

  return {
    id: user._id.toString(),
    email: user.email,
    fullName: profile?.fullName?.trim() || user.fullName?.trim() || null,
    companyName: profile?.companyName?.trim() ?? null,
  };
}

export async function verifyArchitectEligibleForProjectOwnership(
  architectUserId: string,
): Promise<void> {
  await connectDB();

  if (!Types.ObjectId.isValid(architectUserId)) {
    throw new ProjectMutationError(CRM_ERRORS.ARCHITECT_NOT_ELIGIBLE);
  }

  const user = await User.findOne({
    _id: new Types.ObjectId(architectUserId),
    ...ELIGIBLE_ARCHITECT_FILTER,
  })
    .select("_id")
    .lean();

  if (!user) {
    throw new ProjectMutationError(CRM_ERRORS.ARCHITECT_NOT_ELIGIBLE);
  }
}

export async function getArchitectProfileForAdmin(userId: string) {
  await connectDB();

  const profile = await ProfessionalProfile.findOne({
    userId: new Types.ObjectId(userId),
  }).lean();

  if (!profile) {
    return null;
  }

  const view = mapProfessionalProfileToView(profile);
  const completeness = getProfileCompletenessSummary(view);
  return { view, completeness };
}
