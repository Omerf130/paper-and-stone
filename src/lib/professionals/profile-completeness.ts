import type { ProfessionalProfileFormInput } from "@/types/professional-profile";
import type { ProfessionalProfileView } from "@/types/professional-profile";

const PROFILE_FIELDS = [
  { key: "fullName", label: "שם מלא" },
  { key: "phone", label: "טלפון" },
  { key: "companyName", label: "שם חברה" },
  { key: "city", label: "עיר" },
  { key: "bio", label: "אודות" },
] as const;

function isFilled(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function getProfileCompletenessSummary(
  profile: Pick<
    ProfessionalProfileView,
    "fullName" | "phone" | "companyName" | "city" | "bio"
  >,
): {
  filledCount: number;
  totalCount: number;
  isComplete: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];
  let filledCount = 0;

  for (const field of PROFILE_FIELDS) {
    if (isFilled(profile[field.key])) {
      filledCount += 1;
    } else {
      missingFields.push(field.label);
    }
  }

  return {
    filledCount,
    totalCount: PROFILE_FIELDS.length,
    isComplete: filledCount === PROFILE_FIELDS.length,
    missingFields,
  };
}

export function getDisplayName(
  profile: Pick<ProfessionalProfileView, "fullName">,
  fallbackEmail: string,
): string {
  const trimmed = profile.fullName?.trim();
  return trimmed || fallbackEmail;
}

export function toProfileFormInput(
  profile: ProfessionalProfileView,
): ProfessionalProfileFormInput {
  return {
    fullName: profile.fullName ?? "",
    phone: profile.phone ?? "",
    companyName: profile.companyName ?? "",
    city: profile.city ?? "",
    bio: profile.bio ?? "",
  };
}
