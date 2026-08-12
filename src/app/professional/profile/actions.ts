"use server";

import { requireProfessional } from "@/lib/auth/authorization";
import { ProfileMutationError } from "@/lib/professionals/profile-errors";
import { updateMyProfessionalProfile } from "@/lib/professionals/updateMyProfessionalProfile";
import {
  PROFILE_ERRORS,
  parseProfessionalProfileFormInput,
} from "@/lib/professionals/profile-validation";
import type {
  ProfessionalProfileFormInput,
  ProfessionalProfileFormState,
} from "@/types/professional-profile";

export async function updateMyProfessionalProfileAction(
  input: ProfessionalProfileFormInput,
): Promise<ProfessionalProfileFormState> {
  const user = await requireProfessional();

  const parsed = parseProfessionalProfileFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await updateMyProfessionalProfile(user.id, parsed.data);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProfileMutationError) {
      return { error: error.message };
    }

    return { error: PROFILE_ERRORS.GENERIC };
  }
}
