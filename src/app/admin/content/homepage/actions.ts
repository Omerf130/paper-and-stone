"use server";

import { requireAdmin } from "@/lib/auth/authorization";
import {
  parseHomepageAboutFormInput,
  parseHomepageCategoriesFormInput,
  parseHomepageClosingFormInput,
  parseHomepageFeaturedProductsFormInput,
  parseHomepageHeroFormInput,
  parseHomepageInspirationFormInput,
  parseHomepageProfessionalsFormInput,
  parseHomepageSectionOrderFormInput,
  type HomepageAboutFormInput,
  type HomepageCategoriesFormInput,
  type HomepageClosingFormInput,
  type HomepageFeaturedProductsFormInput,
  type HomepageHeroFormInput,
  type HomepageInspirationFormInput,
  type HomepageProfessionalsFormInput,
  type HomepageSectionOrderFormInput,
} from "@/lib/cms/cms-validation";
import {
  HomepageContentMutationError,
  saveHomepageAbout,
  saveHomepageCategories,
  saveHomepageClosing,
  saveHomepageFeaturedProducts,
  saveHomepageHero,
  saveHomepageInspiration,
  saveHomepageProfessionals,
  saveHomepageSectionOrder,
} from "@/lib/cms/homepage-content-mutations";
import { revalidateHomepagePaths } from "@/lib/cms/revalidate-homepage-paths";
import type {
  HomepageAboutFormState,
  HomepageCategoriesFormState,
  HomepageClosingFormState,
  HomepageFeaturedFormState,
  HomepageHeroFormState,
  HomepageInspirationFormState,
  HomepageProfessionalsFormState,
  HomepageSectionOrderFormState,
} from "@/types/admin-homepage-content";

async function runHomepageSectionSave<TInput>(
  parse: (input: unknown) =>
    | { success: true; data: TInput }
    | { success: false; fieldErrors: Record<string, string>; error?: string },
  save: (input: TInput) => Promise<void>,
  input: unknown,
): Promise<{ fieldErrors?: Record<string, string>; error?: string; success?: boolean }> {
  await requireAdmin();

  const parsed = parse(input);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.fieldErrors,
      error: parsed.error,
    };
  }

  try {
    await save(parsed.data);
    await revalidateHomepagePaths();
    return { success: true };
  } catch (error) {
    if (error instanceof HomepageContentMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה בשמירת התוכן. נסו שוב." };
  }
}

export async function saveHomepageHeroAction(
  input: HomepageHeroFormInput,
): Promise<HomepageHeroFormState> {
  return runHomepageSectionSave(parseHomepageHeroFormInput, saveHomepageHero, input);
}

export async function saveHomepageCategoriesAction(
  input: HomepageCategoriesFormInput,
): Promise<HomepageCategoriesFormState> {
  return runHomepageSectionSave(
    parseHomepageCategoriesFormInput,
    saveHomepageCategories,
    input,
  );
}

export async function saveHomepageFeaturedAction(
  input: HomepageFeaturedProductsFormInput,
): Promise<HomepageFeaturedFormState> {
  return runHomepageSectionSave(
    parseHomepageFeaturedProductsFormInput,
    saveHomepageFeaturedProducts,
    input,
  );
}

export async function saveHomepageAboutAction(
  input: HomepageAboutFormInput,
): Promise<HomepageAboutFormState> {
  return runHomepageSectionSave(parseHomepageAboutFormInput, saveHomepageAbout, input);
}

export async function saveHomepageProfessionalsAction(
  input: HomepageProfessionalsFormInput,
): Promise<HomepageProfessionalsFormState> {
  return runHomepageSectionSave(
    parseHomepageProfessionalsFormInput,
    saveHomepageProfessionals,
    input,
  );
}

export async function saveHomepageInspirationAction(
  input: HomepageInspirationFormInput,
): Promise<HomepageInspirationFormState> {
  return runHomepageSectionSave(
    parseHomepageInspirationFormInput,
    saveHomepageInspiration,
    input,
  );
}

export async function saveHomepageClosingAction(
  input: HomepageClosingFormInput,
): Promise<HomepageClosingFormState> {
  return runHomepageSectionSave(parseHomepageClosingFormInput, saveHomepageClosing, input);
}

export async function saveHomepageSectionOrderAction(
  input: HomepageSectionOrderFormInput,
): Promise<HomepageSectionOrderFormState> {
  return runHomepageSectionSave(
    parseHomepageSectionOrderFormInput,
    saveHomepageSectionOrder,
    input,
  );
}
