import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProfessionalProfile, {
  type IProfessionalProfile,
} from "@/models/ProfessionalProfile";
import { mapProfessionalProfileToView } from "@/lib/professionals/mapProfessionalProfileToView";
import type { ProfessionalProfileView } from "@/types/professional-profile";

export async function ensureProfessionalProfile(
  userId: string,
): Promise<ProfessionalProfileView> {
  await connectDB();

  const profile = await ProfessionalProfile.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    {
      $setOnInsert: {
        userId: new Types.ObjectId(userId),
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    },
  );

  if (!profile) {
    throw new Error("Failed to ensure professional profile");
  }

  return mapProfessionalProfileToView(profile);
}

export async function getMyProfessionalProfile(
  userId: string,
): Promise<IProfessionalProfile | null> {
  await connectDB();
  return ProfessionalProfile.findOne({ userId: new Types.ObjectId(userId) });
}

export async function getMyProfessionalProfileView(
  userId: string,
): Promise<ProfessionalProfileView> {
  return ensureProfessionalProfile(userId);
}
