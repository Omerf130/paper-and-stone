import { z } from "zod";
import type { AdminCategoryFormInput } from "@/types/admin-category";
import { CATEGORY_KINDS, type CategoryKind } from "@/types/category-kind";

export const CATEGORY_ERRORS = {
  DUPLICATE_SLUG: "כבר קיימת קטגוריה עם כתובת זו",
  GENERIC: "אירעה שגיאה בשמירת הקטגוריה. נסו שוב.",
} as const;

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

export const categoryInputSchema = z.object({
  nameHe: z.string().min(1, "נא להזין שם בעברית").max(200),
  nameEn: optionalString(200),
  slug: z
    .string()
    .min(1, "נא להזין כתובת")
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "כתובת חייבת להכיל אותיות קטנות, מספרים ומקפים בלבד",
    ),
  sortOrder: z.coerce.number().int().min(0, "סדר חייב להיות 0 ומעלה"),
  isActive: z.boolean(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export type CategoryWriteFields = {
  nameHe: string;
  nameEn?: string;
  slug: string;
  kind?: CategoryKind;
  parentId?: string;
  taxonomyKey?: string;
  descriptionHe?: string;
  descriptionEn?: string;
  sortOrder: number;
  isActive: boolean;
};

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function mapCategoryInputToWriteFields(
  input: CategoryInput,
): CategoryWriteFields {
  return {
    nameHe: input.nameHe.trim(),
    nameEn: emptyToUndefined(input.nameEn),
    slug: input.slug.trim(),
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };
}

export function formatCategoryZodErrors(
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

export function parseCategoryFormInput(
  input: AdminCategoryFormInput,
):
  | { success: true; data: CategoryInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = categoryInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: formatCategoryZodErrors(parsed.error).fieldErrors,
    };
  }

  return { success: true, data: parsed.data };
}
