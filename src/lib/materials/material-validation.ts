import { z } from "zod";
import { normalizeHex } from "@/lib/colors/normalizeHex";
import { normalizeOptionalCode } from "@/lib/shared/normalize-code";
import type { AdminMaterialFormInput } from "@/types/admin-material";
import type { MaterialVariantInput } from "@/types/material-variant";

export const MATERIAL_ERRORS = {
  DUPLICATE_CODE: "כבר קיים חומר עם קוד זה",
  INVALID_TYPE: "סוג החומר שנבחר אינו תקין",
  GENERIC: "אירעה שגיאה בשמירת החומר. נסו שוב.",
} as const;

const ENGLISH_NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s\-'.,&()]*$/;

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

const materialVariantSchema = z
  .object({
    id: z.string().optional(),
    name: z
      .string()
      .min(1, "נא להזין שם variant")
      .max(200)
      .regex(ENGLISH_NAME_REGEX, "שם ה-variant חייב להיות באנגלית"),
    hex: optionalString(7),
    swatchImage: z
      .object({
        storageKey: z.string().min(1),
        url: z.string().url(),
        alt: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      })
      .optional(),
    isActive: z.boolean(),
  })
  .superRefine((variant, context) => {
    const hex = variant.hex?.trim();
    const hasHex = Boolean(hex);
    const hasSwatch = Boolean(variant.swatchImage?.url);

    if (!hasHex && !hasSwatch) {
      context.addIssue({
        code: "custom",
        message: "יש להזין HEX או להעלות תמונת swatch",
        path: ["hex"],
      });
    }

    if (hex) {
      const normalized = normalizeHex(hex);
      if (!normalized) {
        context.addIssue({
          code: "custom",
          message: "ערך HEX לא תקין. השתמשו בפורמט #RRGGBB",
          path: ["hex"],
        });
      }
    }
  });

export const materialInputSchema = z.object({
  nameEn: z
    .string()
    .min(1, "נא להזין שם באנגלית")
    .max(200)
    .regex(ENGLISH_NAME_REGEX, "שם החומר חייב להיות באנגלית"),
  code: optionalString(100),
  type: z.string().min(1, "נא לבחור סוג חומר").max(64),
  isActive: z.boolean(),
  variants: z.array(materialVariantSchema).min(0),
});

export type MaterialInput = z.infer<typeof materialInputSchema>;

export type MaterialWriteFields = {
  nameEn: string;
  nameHe?: string;
  code?: string;
  type: string;
  isActive: boolean;
  variants: MaterialVariantInput[];
};

export function normalizeVariantHex(hex: string | undefined): string | undefined {
  if (!hex?.trim()) {
    return undefined;
  }

  return normalizeHex(hex) ?? undefined;
}

export function mapMaterialInputToWriteFields(
  input: MaterialInput,
): MaterialWriteFields {
  return {
    nameEn: input.nameEn.trim(),
    nameHe: input.nameEn.trim(),
    code: normalizeOptionalCode(input.code),
    type: input.type,
    isActive: input.isActive,
    variants: input.variants.map((variant) => ({
      id: variant.id,
      name: variant.name.trim(),
      hex: normalizeVariantHex(variant.hex),
      swatchImage: variant.swatchImage,
      isActive: variant.isActive,
    })),
  };
}

export function formatMaterialZodErrors(
  error: z.ZodError,
): { fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".");
    if (!fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return { fieldErrors };
}

export function parseMaterialFormInput(
  input: AdminMaterialFormInput,
):
  | { success: true; data: MaterialInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = materialInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: formatMaterialZodErrors(parsed.error).fieldErrors,
    };
  }

  return { success: true, data: parsed.data };
}
