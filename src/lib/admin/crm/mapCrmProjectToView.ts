import type { IProject } from "@/models/Project";
import type { AdminCrmProjectView } from "@/types/admin-crm";

export function mapLeanProjectToCrmView(
  project: Pick<
    IProject,
    "_id" | "name" | "onboardingStatus" | "status" | "items" | "updatedAt" | "ownerUserId" | "clientUserId"
  >,
  labels?: {
    architectName?: string;
    clientName?: string | null;
  },
): AdminCrmProjectView {
  return {
    id: project._id.toString(),
    name: project.name,
    onboardingStatus: project.onboardingStatus ?? null,
    status: project.status,
    itemCount: project.items.length,
    architectUserId: project.ownerUserId.toString(),
    architectName: labels?.architectName,
    clientUserId: project.clientUserId?.toString() ?? null,
    clientName: labels?.clientName ?? undefined,
    updatedAt: project.updatedAt.toISOString(),
  };
}
