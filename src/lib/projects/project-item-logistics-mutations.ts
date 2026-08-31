import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  PROJECT_ITEM_LOGISTICS_ERRORS,
  type ProjectItemLogisticsStatus,
} from "@/types/project-item-logistics";

function buildAdminLogisticsProjectFilter(projectId: string) {
  return {
    _id: new Types.ObjectId(projectId),
    onboardingStatus: "active" as const,
    status: { $nin: ["rejected"] as const },
  };
}

export async function updateProjectItemLogisticsAsAdmin(
  adminUserId: string,
  input: {
    projectId: string;
    itemId: string;
    status: ProjectItemLogisticsStatus;
    note?: string;
  },
): Promise<void> {
  await connectDB();

  if (
    !Types.ObjectId.isValid(input.projectId) ||
    !Types.ObjectId.isValid(input.itemId)
  ) {
    throw new ProjectMutationError(PROJECT_ITEM_LOGISTICS_ERRORS.NOT_FOUND);
  }

  const now = new Date();
  const logisticsSet: Record<string, unknown> = {
    "items.$[item].logistics.status": input.status,
    "items.$[item].logistics.updatedAt": now,
    "items.$[item].logistics.updatedByAdminUserId": new Types.ObjectId(adminUserId),
  };

  if (input.note !== undefined) {
    logisticsSet["items.$[item].logistics.note"] = input.note;
  }

  const result = await Project.updateOne(
    {
      ...buildAdminLogisticsProjectFilter(input.projectId),
      "items._id": new Types.ObjectId(input.itemId),
    },
    { $set: logisticsSet },
    {
      arrayFilters: [{ "item._id": new Types.ObjectId(input.itemId) }],
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ITEM_LOGISTICS_ERRORS.NOT_FOUND);
  }
}
