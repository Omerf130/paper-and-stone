import type {
  HomepageAboutFormInput,
  HomepageCategoriesFormInput,
  HomepageClosingFormInput,
  HomepageFeaturedProductsFormInput,
  HomepageHeroFormInput,
  HomepageInspirationFormInput,
  HomepageProfessionalsFormInput,
  HomepageSectionOrderFormInput,
} from "@/lib/cms/cms-validation";
import type { HomepageContentView, HomepageSectionKey } from "@/types/cms-content";

export type AdminHomepageCategoryOption = {
  id: string;
  nameHe: string;
  slug: string;
  isActive: boolean;
};

export type AdminHomepageCategoryTileState =
  | { status: "unassigned" }
  | { status: "missing"; categoryId: string }
  | { status: "inactive"; categoryId: string; nameHe: string; slug: string }
  | { status: "active"; categoryId: string; nameHe: string; slug: string };

export type AdminHomepageContentPayload = {
  content: HomepageContentView;
  documentExists: boolean;
  categoryOptions: AdminHomepageCategoryOption[];
  categoryTileStates: Record<string, AdminHomepageCategoryTileState>;
};

export type HomepageSectionActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export type HomepageHeroFormState = HomepageSectionActionState;
export type HomepageCategoriesFormState = HomepageSectionActionState;
export type HomepageFeaturedFormState = HomepageSectionActionState;
export type HomepageAboutFormState = HomepageSectionActionState;
export type HomepageProfessionalsFormState = HomepageSectionActionState;
export type HomepageInspirationFormState = HomepageSectionActionState;
export type HomepageClosingFormState = HomepageSectionActionState;
export type HomepageSectionOrderFormState = HomepageSectionActionState;

export function mapHomepageHeroToFormInput(
  hero: HomepageHeroFormInput,
): HomepageHeroFormInput {
  return structuredClone(hero);
}

export function mapHomepageCategoriesToFormInput(
  categories: HomepageCategoriesFormInput,
): HomepageCategoriesFormInput {
  return structuredClone(categories);
}

export function mapHomepageFeaturedToFormInput(
  featured: HomepageFeaturedProductsFormInput,
): HomepageFeaturedProductsFormInput {
  return structuredClone(featured);
}

export function mapHomepageAboutToFormInput(
  about: HomepageAboutFormInput,
): HomepageAboutFormInput {
  return structuredClone(about);
}

export function mapHomepageProfessionalsToFormInput(
  professionals: HomepageProfessionalsFormInput,
): HomepageProfessionalsFormInput {
  return structuredClone(professionals);
}

export function mapHomepageInspirationToFormInput(
  inspiration: HomepageInspirationFormInput,
): HomepageInspirationFormInput {
  return structuredClone(inspiration);
}

export function mapHomepageClosingToFormInput(
  closing: HomepageClosingFormInput,
): HomepageClosingFormInput {
  return structuredClone(closing);
}

export function mapHomepageSectionOrderToFormInput(
  sectionOrder: HomepageSectionOrderFormInput,
): HomepageSectionOrderFormInput {
  return [...sectionOrder];
}

export const HOMEPAGE_SECTION_LABELS: Record<HomepageSectionKey, string> = {
  hero: "Hero",
  categories: "קטגוריות",
  featuredProducts: "מוצרים נבחרים",
  about: "אודות",
  professionals: "אנשי מקצוע",
  inspiration: "השראה",
  closing: "סיום",
};
