import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import User from "@/models/User";
import ProfessionalProfile from "@/models/ProfessionalProfile";
import { resolveAssignedClientFullName } from "@/lib/admin/clients/client-lookup-queries";
import { mapLeanProjectToCrmView } from "@/lib/admin/crm/mapCrmProjectToView";
import type { AdminCrmProjectView } from "@/types/admin-crm";

async function resolveArchitectNames(
  ownerUserIds: string[],
): Promise<Map<string, string>> {
  if (ownerUserIds.length === 0) return new Map();

  const objectIds = ownerUserIds.map((id) => new Types.ObjectId(id));
  const [users, profiles] = await Promise.all([
    User.find({ _id: { $in: objectIds } }).select("fullName email").lean(),
    ProfessionalProfile.find({ userId: { $in: objectIds } })
      .select("userId fullName")
      .lean(),
  ]);

  const profileNameByUserId = new Map(
    profiles.map((profile) => [
      profile.userId.toString(),
      profile.fullName?.trim(),
    ]),
  );

  return new Map(
    users.map((user) => {
      const userId = user._id.toString();
      const name =
        user.fullName?.trim() ||
        profileNameByUserId.get(userId) ||
        user.email;
      return [userId, name];
    }),
  );
}

export async function getAdminCrmProjectsForClient(
  clientUserId: string,
): Promise<AdminCrmProjectView[]> {
  await connectDB();

  if (!Types.ObjectId.isValid(clientUserId)) {
    return [];
  }

  const projects = await Project.find({
    clientUserId: new Types.ObjectId(clientUserId),
  })
    .sort({ updatedAt: -1 })
    .select("name onboardingStatus status items updatedAt ownerUserId clientUserId")
    .lean();

  const ownerIds = [...new Set(projects.map((p) => p.ownerUserId.toString()))];
  const architectNames = await resolveArchitectNames(ownerIds);

  return projects.map((project) =>
    mapLeanProjectToCrmView(project, {
      architectName: architectNames.get(project.ownerUserId.toString()),
    }),
  );
}

export async function getAdminCrmProjectsForArchitect(
  architectUserId: string,
): Promise<AdminCrmProjectView[]> {
  await connectDB();

  if (!Types.ObjectId.isValid(architectUserId)) {
    return [];
  }

  const projects = await Project.find({
    ownerUserId: new Types.ObjectId(architectUserId),
  })
    .sort({ updatedAt: -1 })
    .select("name onboardingStatus status items updatedAt ownerUserId clientUserId")
    .lean();

  const clientIds = [
    ...new Set(
      projects
        .map((p) => p.clientUserId?.toString())
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const clientNames = new Map<string, string>();
  await Promise.all(
    clientIds.map(async (id) => {
      const name = await resolveAssignedClientFullName(id);
      if (name) clientNames.set(id, name);
    }),
  );

  return projects.map((project) => {
    const clientUserId = project.clientUserId?.toString() ?? null;
    return mapLeanProjectToCrmView(project, {
      clientName: clientUserId ? clientNames.get(clientUserId) ?? null : null,
    });
  });
}

export async function countProjectsForClient(clientUserId: string): Promise<number> {
  await connectDB();
  if (!Types.ObjectId.isValid(clientUserId)) return 0;
  return Project.countDocuments({
    clientUserId: new Types.ObjectId(clientUserId),
  });
}

export async function countProjectsForArchitect(
  architectUserId: string,
): Promise<number> {
  await connectDB();
  if (!Types.ObjectId.isValid(architectUserId)) return 0;
  return Project.countDocuments({
    ownerUserId: new Types.ObjectId(architectUserId),
  });
}
