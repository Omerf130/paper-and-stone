"use server";

import { requireAdmin } from "@/lib/auth/authorization";
import {
  mapSiteSettingsFormToWriteFields,
  parseSiteSettingsFormInput,
} from "@/lib/cms/cms-validation";
import { revalidateSiteSettingsPaths } from "@/lib/cms/revalidate-site-settings-paths";
import {
  SiteSettingsMutationError,
  upsertSiteSettings,
} from "@/lib/cms/site-settings-mutations";
import type { SiteSettingsFormInput } from "@/lib/cms/cms-validation";
import type { SiteSettingsFormState } from "@/types/admin-site-settings";

export async function updateSiteSettingsAction(
  input: SiteSettingsFormInput,
): Promise<SiteSettingsFormState> {
  await requireAdmin();

  const parsed = parseSiteSettingsFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await upsertSiteSettings(mapSiteSettingsFormToWriteFields(parsed.data));
    await revalidateSiteSettingsPaths();
    return { success: true };
  } catch (error) {
    if (error instanceof SiteSettingsMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה בשמירת הגדרות האתר. נסו שוב." };
  }
}
