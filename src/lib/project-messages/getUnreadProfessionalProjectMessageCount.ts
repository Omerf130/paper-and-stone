import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProjectMessage from "@/models/ProjectMessage";

export async function getUnreadProfessionalProjectMessageCount(
  ownerUserId: string,
): Promise<number> {
  if (!Types.ObjectId.isValid(ownerUserId)) {
    return 0;
  }

  await connectDB();

  const ownerObjectId = new Types.ObjectId(ownerUserId);
  const viewerObjectId = new Types.ObjectId(ownerUserId);

  const rows = await ProjectMessage.aggregate<{ total: number }>([
    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "project",
      },
    },
    { $unwind: "$project" },
    {
      $match: {
        audience: "professional",
        "project.ownerUserId": ownerObjectId,
        readByUserIds: { $ne: viewerObjectId },
      },
    },
    { $count: "total" },
  ]);

  return rows[0]?.total ?? 0;
}
