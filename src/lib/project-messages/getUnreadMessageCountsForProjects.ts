import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProjectMessage from "@/models/ProjectMessage";
import type { ProjectMessageAudience } from "@/types/project-message";

export async function getUnreadMessageCountsForProjects(
  projectIds: string[],
  viewerUserId: string,
  audience: ProjectMessageAudience,
): Promise<Map<string, number>> {
  if (projectIds.length === 0) {
    return new Map();
  }

  await connectDB();

  const objectIds = projectIds
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  if (objectIds.length === 0) {
    return new Map();
  }

  const rows = await ProjectMessage.aggregate<{ _id: Types.ObjectId; count: number }>([
    {
      $match: {
        projectId: { $in: objectIds },
        audience,
        readByUserIds: { $ne: new Types.ObjectId(viewerUserId) },
      },
    },
    {
      $group: {
        _id: "$projectId",
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(rows.map((row) => [row._id.toString(), row.count]));
}
