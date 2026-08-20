import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import ProfessionalProfile from "@/models/ProfessionalProfile";

export async function resolveArchitectFullNamesForClientProjects(
  ownerUserIds: string[],
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(ownerUserIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  await connectDB();

  const objectIds = uniqueIds
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  if (objectIds.length === 0) {
    return new Map();
  }

  const users = await User.find({ _id: { $in: objectIds } })
    .select("_id fullName email")
    .lean();

  const names = new Map<string, string>();

  for (const user of users) {
    if (user.fullName?.trim()) {
      names.set(user._id.toString(), user.fullName.trim());
    }
  }

  const unresolvedIds = objectIds.filter(
    (id) => !names.has(id.toString()),
  );

  if (unresolvedIds.length > 0) {
    const profiles = await ProfessionalProfile.find({
      userId: { $in: unresolvedIds },
    })
      .select("userId fullName")
      .lean();

    for (const profile of profiles) {
      if (profile.fullName?.trim()) {
        names.set(profile.userId.toString(), profile.fullName.trim());
      }
    }
  }

  for (const user of users) {
    const userId = user._id.toString();
    if (!names.has(userId)) {
      names.set(userId, user.email ?? "אדריכל");
    }
  }

  return names;
}
