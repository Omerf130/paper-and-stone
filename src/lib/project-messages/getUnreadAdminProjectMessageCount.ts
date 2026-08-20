import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { ADMIN_ARCHITECT_CONVERSATION_FILTER } from "@/lib/project-messages/conversation-filters";
import ProjectMessage from "@/models/ProjectMessage";

export async function getUnreadAdminProjectMessageCount(
  adminUserId: string,
): Promise<number> {
  if (!Types.ObjectId.isValid(adminUserId)) {
    return 0;
  }

  await connectDB();

  return ProjectMessage.countDocuments({
    ...ADMIN_ARCHITECT_CONVERSATION_FILTER,
    audience: "admin",
    readByUserIds: { $ne: new Types.ObjectId(adminUserId) },
  });
}
