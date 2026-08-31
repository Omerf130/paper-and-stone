"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";
import { updateArchitectProfileAsAdmin } from "@/lib/admin/architects/architect-admin-mutations";
import {
  findArchitectByIdForAdmin,
  searchArchitectsForAdmin,
} from "@/lib/admin/architects/architect-lookup-queries";
import { createArchitectAsAdmin } from "@/lib/admin/crm/admin-create-user-mutations";
import { parseAdminCreateUserInput } from "@/lib/admin/crm/admin-create-user-validation";
import { ProfileMutationError } from "@/lib/professionals/profile-errors";
import { parseProfessionalProfileFormInput } from "@/lib/professionals/profile-validation";
import { UserMutationError } from "@/lib/users/user-errors";
import type { ProfessionalProfileFormInput } from "@/types/professional-profile";

export async function searchArchitectsForCrmAction(query: string) {
  await requireAdmin();
  const architects = await searchArchitectsForAdmin(query);
  return { architects };
}

export async function getArchitectLookupAction(architectId: string) {
  await requireAdmin();
  const architect = await findArchitectByIdForAdmin(architectId);
  return { architect };
}

export async function getAdminArchitectDetailAction(architectId: string) {
  await requireAdmin();
  const { getAdminArchitectDetail } = await import(
    "@/lib/admin/architects/getAdminArchitects"
  );
  return getAdminArchitectDetail(architectId);
}

export async function createArchitectAsAdminAction(input: unknown) {
  await requireAdmin();

  const parsed = parseAdminCreateUserInput(input);
  if (!parsed.success) {
    return { error: Object.values(parsed.fieldErrors)[0] };
  }

  try {
    const architectId = await createArchitectAsAdmin(parsed.data);
    revalidatePath("/admin/architects");
    return { success: true, architectId };
  } catch (error: unknown) {
    if (error instanceof UserMutationError) {
      return { error: error.message };
    }
    return { error: "אירעה שגיאה ביצירת האדריכל." };
  }
}

export async function updateArchitectProfileAsAdminAction(
  architectId: string,
  input: ProfessionalProfileFormInput,
) {
  await requireAdmin();

  const parsed = parseProfessionalProfileFormInput(input);
  if (!parsed.success) {
    return { error: Object.values(parsed.fieldErrors)[0] };
  }

  try {
    await updateArchitectProfileAsAdmin(architectId, parsed.data);
    revalidatePath(`/admin/architects/${architectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UserMutationError || error instanceof ProfileMutationError) {
      return { error: error.message };
    }
    return { error: "אירעה שגיאה בעדכון הפרופיל." };
  }
}
