import { z } from "zod";
import { normalizeOptionalCode } from "@/lib/shared/normalize-code";
import { BUILTIN_MATERIAL_TYPE_KEYS } from "@/types/material";
import type { AdminMaterialTypeFormInput } from "@/types/admin-material-type";

export const MATERIAL_TYPE_ERRORS = {
  DUPLICATE_KEY: "כבר קיים סוג חומר עם מפתח זה",
  INVALID_KEY: "מפתח סוג חומר חייב להכיל אותיות גדולות, מספרים וקווים תחתונים",
  GENERIC: "אירעה שגיאה בשמירת סוג החומר. נסו שוב.",
} as const;

const materialTypeKeySchema = z
  .string()
  .min(1, "נא להזין מפתח")
  .max(64)
  .regex(
    /^[A-Z][A-Z0-9_]*$/,
    MATERIAL_TYPE_ERRORS.INVALID_KEY,
  )
  .refine(
    (key) => !BUILTIN_MATERIAL_TYPE_KEYS.includes(key as never),
    "מפתח זה שמור לסוג מובנה",
  );

export const materialTypeInputSchema = z.object({
  key: materialTypeKeySchema,
  labelEn: z
    .string()
    .min(1, "נא להזין שם באנגלית")
    .max(120)
    .regex(/^[A-Za-z0-9][A-Za-z0-9\s\-'.,&()]*$/, "השם חייב להיות באנגלית"),
});

export type MaterialTypeInput = z.infer<typeof materialTypeInputSchema>;

export type MaterialTypeWriteFields = {
  key: string;
  labelEn: string;
};

export function mapMaterialTypeInputToWriteFields(
  input: MaterialTypeInput,
): MaterialTypeWriteFields {
  return {
    key: input.key.trim().toUpperCase(),
    labelEn: input.labelEn.trim(),
  };
}

export function formatMaterialTypeZodErrors(
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

export function parseMaterialTypeFormInput(
  input: AdminMaterialTypeFormInput,
):
  | { success: true; data: MaterialTypeInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = materialTypeInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: formatMaterialTypeZodErrors(parsed.error).fieldErrors,
    };
  }

  return { success: true, data: parsed.data };
}

export function slugifyMaterialTypeKey(label: string): string {
  return label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

export { normalizeOptionalCode };
