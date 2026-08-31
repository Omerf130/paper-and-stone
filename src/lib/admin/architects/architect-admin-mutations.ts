import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ProfessionalProfile from "@/models/ProfessionalProfile";
import User from "@/models/User";
import { ensureProfessionalProfile } from "@/lib/professionals/ensureProfessionalProfile";
import { ProfileMutationError } from "@/lib/professionals/profile-errors";
import { PROFILE_ERRORS, type ProfessionalProfileWriteFields } from "@/lib/professionals/profile-validation";
import { UserMutationError } from "@/lib/users/user-errors";
import { ARCHITECT_ROLE_FILTER } from "@/lib/auth/user-role";
import { CRM_ERRORS } from "@/types/admin-crm";

function toNullableField(value: string | undefined): string | null {
  return value ?? null;
}

export async function updateArchitectProfileAsAdmin(
  architectUserId: string,
  fields: ProfessionalProfileWriteFields,
): Promise<void> {
  await connectDB();

  if (!Types.ObjectId.isValid(architectUserId)) {
    throw new UserMutationError(CRM_ERRORS.NOT_FOUND);
  }

  const user = await User.findOne({
    _id: new Types.ObjectId(architectUserId),
    role: ARCHITECT_ROLE_FILTER,
  }).select("_id");

  if (!user) {
    throw new UserMutationError(CRM_ERRORS.NOT_FOUND);
  }

  await ensureProfessionalProfile(architectUserId);

  const result = await ProfessionalProfile.updateOne(
    { userId: user._id },
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

  if (fields.fullName?.trim()) {
    await User.updateOne(
      { _id: user._id },
      { $set: { fullName: fields.fullName.trim() } },
    );
  }
}
