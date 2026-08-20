import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import ProfessionalProfile from "@/models/ProfessionalProfile";

export async function resolveArchitectFullNameForSnapshot(
  architectUserId: string,
): Promise<string> {
  await connectDB();

  const user = await User.findById(architectUserId).select("fullName email").lean();

  if (user?.fullName?.trim()) {
    return user.fullName.trim();
  }

  const profile = await ProfessionalProfile.findOne({
    userId: new Types.ObjectId(architectUserId),
  })
    .select("fullName")
    .lean();

  if (profile?.fullName?.trim()) {
    return profile.fullName.trim();
  }

  return user?.email ?? "אדריכל";
}
