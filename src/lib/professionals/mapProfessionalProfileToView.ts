import type { IProfessionalProfile } from "@/models/ProfessionalProfile";
import type { ProfessionalProfileView } from "@/types/professional-profile";

export function mapProfessionalProfileToView(
  profile: IProfessionalProfile,
): ProfessionalProfileView {
  return {
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    fullName: profile.fullName,
    phone: profile.phone,
    companyName: profile.companyName,
    city: profile.city,
    bio: profile.bio,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}
