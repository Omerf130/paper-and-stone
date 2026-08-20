import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import type { ClientAssignedProjectMetadata } from "@/types/client-project";

export type GetClientAssignedProjectsMetadataInput = {
  clientUserId: string;
  limit?: number;
  skip?: number;
  search?: string | null;
};

export type ClientAssignedProjectsMetadataResult = {
  projects: ClientAssignedProjectMetadata[];
  total: number;
};

function buildAssignedProjectsFilter(
  clientUserId: string,
  search?: string | null,
): Record<string, unknown> {
  const filter: Record<string, unknown> = {
    clientUserId: new Types.ObjectId(clientUserId),
  };

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    filter.name = { $regex: trimmedSearch, $options: "i" };
  }

  return filter;
}

export async function getClientAssignedProjectsMetadata(
  input: GetClientAssignedProjectsMetadataInput,
): Promise<ClientAssignedProjectsMetadataResult> {
  if (!Types.ObjectId.isValid(input.clientUserId)) {
    return { projects: [], total: 0 };
  }

  await connectDB();

  const filter = buildAssignedProjectsFilter(
    input.clientUserId,
    input.search,
  );

  const query = Project.find(filter)
    .select(
      "_id name ownerUserId status commercialDirty submissionRevision updatedAt",
    )
    .sort({ updatedAt: -1 });

  if (input.skip != null) {
    query.skip(input.skip);
  }

  if (input.limit != null) {
    query.limit(input.limit);
  }

  const [projects, total] = await Promise.all([
    query.lean(),
    Project.countDocuments(filter),
  ]);

  return {
    projects: projects.map((project) => ({
      projectId: project._id.toString(),
      projectName: project.name,
      ownerUserId: project.ownerUserId.toString(),
      status: project.status,
      commercialDirty: project.commercialDirty ?? false,
      submissionRevision: project.submissionRevision ?? 0,
      updatedAt: project.updatedAt.toISOString(),
    })),
    total,
  };
}

export async function getClientAssignedProjectMetadataById(
  clientUserId: string,
  projectId: string,
): Promise<ClientAssignedProjectMetadata | null> {
  if (
    !Types.ObjectId.isValid(clientUserId) ||
    !Types.ObjectId.isValid(projectId)
  ) {
    return null;
  }

  await connectDB();

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    clientUserId: new Types.ObjectId(clientUserId),
  })
    .select(
      "_id name ownerUserId status commercialDirty submissionRevision updatedAt",
    )
    .lean();

  if (!project) {
    return null;
  }

  return {
    projectId: project._id.toString(),
    projectName: project.name,
    ownerUserId: project.ownerUserId.toString(),
    status: project.status,
    commercialDirty: project.commercialDirty ?? false,
    submissionRevision: project.submissionRevision ?? 0,
    updatedAt: project.updatedAt.toISOString(),
  };
}
