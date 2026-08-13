"use server";

import { requireAdmin } from "@/lib/auth/authorization";
import {
  mapCatalogPageContentFormToWriteFields,
  parseCatalogPageContentFormInput,
} from "@/lib/cms/cms-validation";
import type { CatalogPageContentFormInput } from "@/lib/cms/cms-validation";
import {
  CatalogPageContentMutationError,
  upsertCatalogPageContent,
} from "@/lib/cms/catalog-page-content-mutations";
import { revalidateCatalogPaths } from "@/lib/cms/revalidate-catalog-paths";
import type { CatalogPageContentFormState } from "@/types/admin-catalog-page-content";

export async function updateCatalogPageContentAction(
  input: CatalogPageContentFormInput,
): Promise<CatalogPageContentFormState> {
  await requireAdmin();

  const parsed = parseCatalogPageContentFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await upsertCatalogPageContent(
      mapCatalogPageContentFormToWriteFields(parsed.data),
    );
    await revalidateCatalogPaths();
    return { success: true };
  } catch (error) {
    if (error instanceof CatalogPageContentMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה בשמירת תוכן הקטלוג. נסו שוב." };
  }
}
