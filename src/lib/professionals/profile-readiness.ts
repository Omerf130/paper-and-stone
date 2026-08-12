import type { ProfessionalProfileView } from "@/types/professional-profile";

function isFilled(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function isProfileReadyForProjects(
  profile: Pick<ProfessionalProfileView, "fullName" | "phone">,
): boolean {
  return isFilled(profile.fullName) && isFilled(profile.phone);
}
