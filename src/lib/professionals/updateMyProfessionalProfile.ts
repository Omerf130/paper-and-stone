import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProfessionalProfile from "@/models/ProfessionalProfile";
import { ProfileMutationError } from "@/lib/professionals/profile-errors";
import { PROFILE_ERRORS } from "@/lib/professionals/profile-validation";
import type { ProfessionalProfileWriteFields } from "@/lib/professionals/profile-validation";

function toNullableField(value: string | undefined): string | null {
  return value ?? null;
}

export async function updateMyProfessionalProfile(
  userId: string,
  fields: ProfessionalProfileWriteFields,
): Promise<void> {
  await connectDB();

  const result = await ProfessionalProfile.updateOne(
    { userId: new Types.ObjectId(userId) },
    {
      $set: {
        fullName: toNullableField(fields.fullName),
        phone: toNullableField(fields.phone),
        companyName: toNullableField(fields.companyName),
        city: toNullableField(fields.city),
        bio: toNullableField(fields.bio),
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProfileMutationError(PROFILE_ERRORS.GENERIC);
  }
}
