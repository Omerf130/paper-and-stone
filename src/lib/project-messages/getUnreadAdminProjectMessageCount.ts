import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProjectMessage from "@/models/ProjectMessage";

export async function getUnreadAdminProjectMessageCount(
  adminUserId: string,
): Promise<number> {
  if (!Types.ObjectId.isValid(adminUserId)) {
    return 0;
  }

  await connectDB();

  return ProjectMessage.countDocuments({
    audience: "admin",
    readByUserIds: { $ne: new Types.ObjectId(adminUserId) },
  });
}
