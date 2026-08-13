import { Types } from "mongoose";
import { z } from "zod";
import { CMS_CTA_ERRORS, isSafeInternalCtaHref } from "@/lib/cms/cms-cta-validation";
import { CMS_LIMITS, CMS_SCHEMA_VERSION } from "@/lib/cms/cms-constants";
import type { SiteSettingsWriteFields } from "@/lib/cms/site-settings-mutations";
import type { CatalogPageContentWriteFields } from "@/lib/cms/catalog-page-content-mutations";
import {
  CMS_SINGLETON_KEYS,
  HOMEPAGE_SECTION_KEYS,
  type HomepageSectionKey,
} from "@/types/cms-content";

export const CMS_ERRORS = {
  INVALID_CATEGORY_ID: "מזהה קטגוריה לא תקין.",
  DUPLICATE_CATEGORY: "לא ניתן לבחור את אותה קטגוריה פעמיים.",
  DUPLICATE_ITEM_ID: "מזהה פריט כפול.",
  INVALID_ITEM_ID: "מזהה פריט לא תקין.",
  INVALID_SECTION_ORDER: "סדר הסקשנים אינו תקין.",
  MISSING_ALT: "נא להזין טקסט חלופי לתמונה.",
  GENERIC: "תוכן CMS לא תקין.",
} as const;

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value));

const requiredTrimmedString = (max: number, message: string) =>
  z.string().trim().min(1, message).max(max);

export const objectIdSchema = z
  .string()
  .min(1, CMS_ERRORS.INVALID_CATEGORY_ID)
  .refine((value) => Types.ObjectId.isValid(value), CMS_ERRORS.INVALID_CATEGORY_ID);

export const cmsImageSchema = z
  .object({
    url: requiredTrimmedString(2000, "נא להזין כתובת תמונה."),
    storageKey: requiredTrimmedString(500, "נא להזין מפתח אחסון."),
    alt: optionalTrimmedString(CMS_LIMITS.imageAlt),
    isDecorative: z.boolean().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.isDecorative) {
      return;
    }

    const alt = value.alt?.trim();
    if (!alt) {
      ctx.addIssue({
        code: "custom",
        message: CMS_ERRORS.MISSING_ALT,
        path: ["alt"],
      });
    }
  });

export const cmsCtaSchema = z.object({
  label: requiredTrimmedString(CMS_LIMITS.ctaLabel, CMS_CTA_ERRORS.REQUIRED_LABEL),
  href: requiredTrimmedString(CMS_LIMITS.ctaHref, CMS_CTA_ERRORS.REQUIRED_HREF).refine(
    isSafeInternalCtaHref,
    CMS_CTA_ERRORS.UNSAFE_HREF,
  ),
  isVisible: z.boolean().optional(),
});

export const homepageSectionKeySchema = z.enum(HOMEPAGE_SECTION_KEYS);

export function validateHomepageSectionOrder(
  order: readonly string[],
):
  | { success: true; data: HomepageSectionKey[] }
  | { success: false; error: string } {
  if (order.length !== HOMEPAGE_SECTION_KEYS.length) {
    return { success: false, error: CMS_ERRORS.INVALID_SECTION_ORDER };
  }

  const seen = new Set<string>();
  for (const key of order) {
    if (!HOMEPAGE_SECTION_KEYS.includes(key as HomepageSectionKey)) {
      return { success: false, error: CMS_ERRORS.INVALID_SECTION_ORDER };
    }

    if (seen.has(key)) {
      return { success: false, error: CMS_ERRORS.INVALID_SECTION_ORDER };
    }

    seen.add(key);
  }

  if (order[0] !== "hero") {
    return { success: false, error: CMS_ERRORS.INVALID_SECTION_ORDER };
  }

  for (const expected of HOMEPAGE_SECTION_KEYS) {
    if (!seen.has(expected)) {
      return { success: false, error: CMS_ERRORS.INVALID_SECTION_ORDER };
    }
  }

  return { success: true, data: [...order] as HomepageSectionKey[] };
}

export const homepageSectionOrderSchema = z
  .array(homepageSectionKeySchema)
  .superRefine((order, ctx) => {
    const result = validateHomepageSectionOrder(order);
    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        message: result.error,
      });
    }
  });

export const cmsItemIdSchema = z
  .string()
  .uuid(CMS_ERRORS.INVALID_ITEM_ID);

function validateUniqueItemIds<T extends { id: string }>(
  items: T[],
  ctx: z.RefinementCtx,
): void {
  const seen = new Set<string>();

  for (const [index, item] of items.entries()) {
    if (seen.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        message: CMS_ERRORS.DUPLICATE_ITEM_ID,
        path: [index, "id"],
      });
      continue;
    }

    seen.add(item.id);
  }
}

export const homepageCategoryItemSchema = z.object({
  id: cmsItemIdSchema,
  categoryId: objectIdSchema.optional(),
  displayTitle: optionalTrimmedString(CMS_LIMITS.categoryDisplayTitle),
  image: cmsImageSchema.optional(),
  layout: z.enum(["large", "medium"]),
  isVisible: z.boolean(),
  order: z.number().int().min(0),
});

export const homepageInspirationItemSchema = z.object({
  id: cmsItemIdSchema,
  title: requiredTrimmedString(CMS_LIMITS.inspirationTitle, "נא להזין כותרת."),
  subtitle: requiredTrimmedString(
    CMS_LIMITS.inspirationSubtitle,
    "נא להזין כותרת משנה.",
  ),
  image: cmsImageSchema.optional(),
  layout: z.enum(["featured", "standard"]),
  isVisible: z.boolean(),
  order: z.number().int().min(0),
});

export const homepageProfessionalStepSchema = z.object({
  id: cmsItemIdSchema,
  step: requiredTrimmedString(
    CMS_LIMITS.professionalStepNumber,
    "נא להזין מספר שלב.",
  ),
  title: requiredTrimmedString(
    CMS_LIMITS.professionalStepTitle,
    "נא להזין כותרת שלב.",
  ),
  order: z.number().int().min(0),
});

const homepageHeroSchema = z.object({
  eyebrow: requiredTrimmedString(CMS_LIMITS.eyebrow, "נא להזין כותרת עליונה."),
  heading: requiredTrimmedString(CMS_LIMITS.heading, "נא להזין כותרת."),
  supportingText: requiredTrimmedString(
    CMS_LIMITS.supportingText,
    "נא להזין טקסט תומך.",
  ),
  image: cmsImageSchema.optional(),
  primaryCta: cmsCtaSchema,
  secondaryCta: cmsCtaSchema,
  isVisible: z.literal(true),
});

const homepageCategoriesSchema = z.object({
  eyebrow: requiredTrimmedString(CMS_LIMITS.eyebrow, "נא להזין כותרת עליונה."),
  heading: requiredTrimmedString(CMS_LIMITS.heading, "נא להזין כותרת."),
  supportingText: requiredTrimmedString(
    CMS_LIMITS.supportingText,
    "נא להזין טקסט תומך.",
  ),
  items: z
    .array(homepageCategoryItemSchema)
    .max(CMS_LIMITS.homepageCategoryItems)
    .superRefine((items, ctx) => {
      validateUniqueItemIds(items, ctx);
      const seenCategoryIds = new Set<string>();

      for (const [index, item] of items.entries()) {
        if (!item.categoryId) {
          continue;
        }

        if (seenCategoryIds.has(item.categoryId)) {
          ctx.addIssue({
            code: "custom",
            message: CMS_ERRORS.DUPLICATE_CATEGORY,
            path: [index, "categoryId"],
          });
          continue;
        }

        seenCategoryIds.add(item.categoryId);
      }
    }),
  isVisible: z.boolean(),
});

const homepageFeaturedProductsSchema = z.object({
  eyebrow: requiredTrimmedString(CMS_LIMITS.eyebrow, "נא להזין כותרת עליונה."),
  heading: requiredTrimmedString(CMS_LIMITS.heading, "נא להזין כותרת."),
  supportingText: optionalTrimmedString(CMS_LIMITS.supportingText),
  cta: cmsCtaSchema,
  isVisible: z.boolean(),
});

const homepageAboutSchema = z.object({
  eyebrow: requiredTrimmedString(CMS_LIMITS.eyebrow, "נא להזין כותרת עליונה."),
  heading: requiredTrimmedString(CMS_LIMITS.heading, "נא להזין כותרת."),
  body: requiredTrimmedString(CMS_LIMITS.body, "נא להזין תוכן."),
  image: cmsImageSchema.optional(),
  isVisible: z.boolean(),
});

const homepageProfessionalsSchema = z.object({
  eyebrow: requiredTrimmedString(CMS_LIMITS.eyebrow, "נא להזין כותרת עליונה."),
  heading: requiredTrimmedString(CMS_LIMITS.heading, "נא להזין כותרת."),
  body: requiredTrimmedString(CMS_LIMITS.body, "נא להזין תוכן."),
  image: cmsImageSchema.optional(),
  steps: z
    .array(homepageProfessionalStepSchema)
    .max(CMS_LIMITS.professionalSteps)
    .superRefine((items, ctx) => {
      validateUniqueItemIds(items, ctx);
    }),
  primaryCta: cmsCtaSchema,
  secondaryCta: cmsCtaSchema,
  isVisible: z.boolean(),
});

const homepageInspirationSchema = z.object({
  eyebrow: requiredTrimmedString(CMS_LIMITS.eyebrow, "נא להזין כותרת עליונה."),
  heading: requiredTrimmedString(CMS_LIMITS.heading, "נא להזין כותרת."),
  supportingText: optionalTrimmedString(CMS_LIMITS.supportingText),
  items: z
    .array(homepageInspirationItemSchema)
    .max(CMS_LIMITS.inspirationItems)
    .superRefine((items, ctx) => {
      validateUniqueItemIds(items, ctx);
    }),
  isVisible: z.boolean(),
});

const homepageClosingSchema = z.object({
  heading: requiredTrimmedString(CMS_LIMITS.heading, "נא להזין כותרת."),
  supportingText: requiredTrimmedString(
    CMS_LIMITS.supportingText,
    "נא להזין טקסט תומך.",
  ),
  contactNote: optionalTrimmedString(CMS_LIMITS.supportingText),
  primaryCta: cmsCtaSchema,
  secondaryCta: cmsCtaSchema,
  isVisible: z.boolean(),
});

export const siteSettingsSeoSchema = z.object({
  defaultTitle: optionalTrimmedString(CMS_LIMITS.seoTitle),
  defaultDescription: optionalTrimmedString(CMS_LIMITS.seoDescription),
});

export const siteSettingsFormSchema = z.object({
  brandName: requiredTrimmedString(CMS_LIMITS.brandName, "נא להזין שם מותג."),
  contactEmail: optionalTrimmedString(CMS_LIMITS.contactField).refine(
    (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "כתובת אימייל לא תקינה.",
  ),
  contactPhone: optionalTrimmedString(CMS_LIMITS.contactField),
  whatsappPhone: optionalTrimmedString(CMS_LIMITS.contactField),
  address: optionalTrimmedString(CMS_LIMITS.address),
  footerDescription: requiredTrimmedString(
    CMS_LIMITS.footerDescription,
    "נא להזין תיאור בפוטר.",
  ),
  copyrightCompanyName: optionalTrimmedString(CMS_LIMITS.copyrightCompanyName),
  seoDefaultTitle: optionalTrimmedString(CMS_LIMITS.seoTitle),
  seoDefaultDescription: optionalTrimmedString(CMS_LIMITS.seoDescription),
});

export type SiteSettingsFormInput = z.infer<typeof siteSettingsFormSchema>;

export function formatSiteSettingsZodErrors(
  error: z.ZodError,
): { fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return { fieldErrors };
}

export function parseSiteSettingsFormInput(
  input: SiteSettingsFormInput,
):
  | { success: true; data: SiteSettingsFormInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = siteSettingsFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: formatSiteSettingsZodErrors(parsed.error).fieldErrors,
    };
  }

  return { success: true, data: parsed.data };
}

export function mapSiteSettingsFormToWriteFields(
  input: SiteSettingsFormInput,
): Omit<SiteSettingsWriteFields, "logo"> {
  return {
    brandName: input.brandName.trim(),
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    whatsappPhone: input.whatsappPhone,
    address: input.address,
    footerDescription: input.footerDescription.trim(),
    copyrightCompanyName: input.copyrightCompanyName,
    seo:
      input.seoDefaultTitle || input.seoDefaultDescription
        ? {
            defaultTitle: input.seoDefaultTitle,
            defaultDescription: input.seoDefaultDescription,
          }
        : undefined,
  };
}

export const siteSettingsInputSchema = z.object({
  key: z.literal(CMS_SINGLETON_KEYS.site),
  schemaVersion: z.number().int().min(1).default(CMS_SCHEMA_VERSION),
  brandName: requiredTrimmedString(CMS_LIMITS.brandName, "נא להזין שם מותג."),
  logo: cmsImageSchema.optional(),
  contactEmail: optionalTrimmedString(CMS_LIMITS.contactField),
  contactPhone: optionalTrimmedString(CMS_LIMITS.contactField),
  whatsappPhone: optionalTrimmedString(CMS_LIMITS.contactField),
  address: optionalTrimmedString(CMS_LIMITS.address),
  footerDescription: requiredTrimmedString(
    CMS_LIMITS.footerDescription,
    "נא להזין תיאור בפוטר.",
  ),
  copyrightCompanyName: optionalTrimmedString(CMS_LIMITS.copyrightCompanyName),
  seo: siteSettingsSeoSchema.optional(),
});

export const homepageContentInputSchema = z.object({
  key: z.literal(CMS_SINGLETON_KEYS.homepage),
  schemaVersion: z.number().int().min(1).default(CMS_SCHEMA_VERSION),
  sectionOrder: homepageSectionOrderSchema,
  hero: homepageHeroSchema,
  categories: homepageCategoriesSchema,
  featuredProducts: homepageFeaturedProductsSchema,
  about: homepageAboutSchema,
  professionals: homepageProfessionalsSchema,
  inspiration: homepageInspirationSchema,
  closing: homepageClosingSchema,
});

export const catalogPageContentInputSchema = z.object({
  key: z.literal(CMS_SINGLETON_KEYS.catalog),
  schemaVersion: z.number().int().min(1).default(CMS_SCHEMA_VERSION),
  eyebrow: requiredTrimmedString(CMS_LIMITS.eyebrow, "נא להזין כותרת עליונה."),
  heading: requiredTrimmedString(CMS_LIMITS.heading, "נא להזין כותרת."),
  supportingText: requiredTrimmedString(
    CMS_LIMITS.supportingText,
    "נא להזין טקסט תומך.",
  ),
});

export const catalogPageContentFormSchema = z.object({
  eyebrow: requiredTrimmedString(CMS_LIMITS.eyebrow, "נא להזין כותרת עליונה."),
  heading: requiredTrimmedString(CMS_LIMITS.heading, "נא להזין כותרת."),
  supportingText: requiredTrimmedString(
    CMS_LIMITS.supportingText,
    "נא להזין טקסט תומך.",
  ),
});

export type CatalogPageContentFormInput = z.infer<typeof catalogPageContentFormSchema>;

export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;
export type HomepageContentInput = z.infer<typeof homepageContentInputSchema>;
export type CatalogPageContentInput = z.infer<typeof catalogPageContentInputSchema>;

export function parseSiteSettingsInput(
  value: unknown,
):
  | { success: true; data: SiteSettingsInput }
  | { success: false; error: string } {
  const parsed = siteSettingsInputSchema.safeParse(value);

  if (!parsed.success) {
    return { success: false, error: CMS_ERRORS.GENERIC };
  }

  return { success: true, data: parsed.data };
}

export function parseHomepageContentInput(
  value: unknown,
):
  | { success: true; data: HomepageContentInput }
  | { success: false; error: string } {
  const parsed = homepageContentInputSchema.safeParse(value);

  if (!parsed.success) {
    return { success: false, error: CMS_ERRORS.GENERIC };
  }

  return { success: true, data: parsed.data };
}

export function parseCatalogPageContentInput(
  value: unknown,
):
  | { success: true; data: CatalogPageContentInput }
  | { success: false; error: string } {
  const parsed = catalogPageContentInputSchema.safeParse(value);

  if (!parsed.success) {
    return { success: false, error: CMS_ERRORS.GENERIC };
  }

  return { success: true, data: parsed.data };
}

export function parseCatalogPageContentFormInput(
  input: CatalogPageContentFormInput,
):
  | { success: true; data: CatalogPageContentFormInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = catalogPageContentFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: formatSiteSettingsZodErrors(parsed.error).fieldErrors,
    };
  }

  return { success: true, data: parsed.data };
}

export function mapCatalogPageContentFormToWriteFields(
  input: CatalogPageContentFormInput,
): CatalogPageContentWriteFields {
  return {
    eyebrow: input.eyebrow.trim(),
    heading: input.heading.trim(),
    supportingText: input.supportingText.trim(),
  };
}

export function homepageContentHasFeaturedProductIds(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  const forbiddenKeys = ["productIds", "featuredProductIds", "products"];

  for (const key of forbiddenKeys) {
    if (key in record) {
      return true;
    }
  }

  const featuredProducts = record.featuredProducts;
  if (featuredProducts && typeof featuredProducts === "object") {
    const featuredRecord = featuredProducts as Record<string, unknown>;
    return forbiddenKeys.some((key) => key in featuredRecord);
  }

  return false;
}

export const homepageHeroFormSchema = homepageHeroSchema;
export const homepageCategoriesFormSchema = homepageCategoriesSchema;
export const homepageFeaturedProductsFormSchema = homepageFeaturedProductsSchema;
export const homepageAboutFormSchema = homepageAboutSchema;
export const homepageProfessionalsFormSchema = homepageProfessionalsSchema;
export const homepageInspirationFormSchema = homepageInspirationSchema;
export const homepageClosingFormSchema = homepageClosingSchema;
export const homepageSectionOrderFormSchema = homepageSectionOrderSchema;

export type HomepageHeroFormInput = z.infer<typeof homepageHeroFormSchema>;
export type HomepageCategoriesFormInput = z.infer<
  typeof homepageCategoriesFormSchema
>;
export type HomepageFeaturedProductsFormInput = z.infer<
  typeof homepageFeaturedProductsFormSchema
>;
export type HomepageAboutFormInput = z.infer<typeof homepageAboutFormSchema>;
export type HomepageProfessionalsFormInput = z.infer<
  typeof homepageProfessionalsFormSchema
>;
export type HomepageInspirationFormInput = z.infer<
  typeof homepageInspirationFormSchema
>;
export type HomepageClosingFormInput = z.infer<typeof homepageClosingFormSchema>;
export type HomepageSectionOrderFormInput = z.infer<
  typeof homepageSectionOrderFormSchema
>;

function formatHomepageZodErrors(error: z.ZodError): {
  fieldErrors: Record<string, string>;
  generalError?: string;
} {
  const fieldErrors: Record<string, string> = {};
  let generalError: string | undefined;

  for (const issue of error.issues) {
    const pathKey = issue.path.map(String).join(".");
    if (pathKey && !fieldErrors[pathKey]) {
      fieldErrors[pathKey] = issue.message;
    } else if (!generalError) {
      generalError = issue.message;
    }
  }

  return { fieldErrors, generalError };
}

function parseHomepageSectionFormInput<T>(
  schema: z.ZodType<T>,
  input: unknown,
):
  | { success: true; data: T }
  | { success: false; fieldErrors: Record<string, string>; error?: string } {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    const formatted = formatHomepageZodErrors(parsed.error);
    return {
      success: false,
      fieldErrors: formatted.fieldErrors,
      error: formatted.generalError ?? CMS_ERRORS.GENERIC,
    };
  }

  return { success: true, data: parsed.data };
}

export function parseHomepageHeroFormInput(input: unknown) {
  return parseHomepageSectionFormInput(homepageHeroFormSchema, input);
}

export function parseHomepageCategoriesFormInput(input: unknown) {
  return parseHomepageSectionFormInput(homepageCategoriesFormSchema, input);
}

export function parseHomepageFeaturedProductsFormInput(input: unknown) {
  if (homepageContentHasFeaturedProductIds(input)) {
    return {
      success: false as const,
      fieldErrors: {},
      error: "לא ניתן לנהל מוצרים מומלצים מכאן.",
    };
  }

  return parseHomepageSectionFormInput(homepageFeaturedProductsFormSchema, input);
}

export function parseHomepageAboutFormInput(input: unknown) {
  return parseHomepageSectionFormInput(homepageAboutFormSchema, input);
}

export function parseHomepageProfessionalsFormInput(input: unknown) {
  return parseHomepageSectionFormInput(homepageProfessionalsFormSchema, input);
}

export function parseHomepageInspirationFormInput(input: unknown) {
  return parseHomepageSectionFormInput(homepageInspirationFormSchema, input);
}

export function parseHomepageClosingFormInput(input: unknown) {
  return parseHomepageSectionFormInput(homepageClosingFormSchema, input);
}

export function parseHomepageSectionOrderFormInput(input: unknown) {
  return parseHomepageSectionFormInput(homepageSectionOrderFormSchema, input);
}
