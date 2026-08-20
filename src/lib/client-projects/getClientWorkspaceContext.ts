import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import type { ClientWorkspaceContext } from "@/types/client-project";

export async function getClientWorkspaceContext(
  userId: string,
): Promise<ClientWorkspaceContext> {
  if (!Types.ObjectId.isValid(userId)) {
    return {
      displayName: "לקוח",
      hasArchitectRequest: false,
    };
  }

  await connectDB();

  const user = await User.findById(userId)
    .select("fullName requestedRole")
    .lean();

  return {
    displayName: user?.fullName?.trim() || "לקוח",
    hasArchitectRequest: user?.requestedRole === "architect",
  };
}
