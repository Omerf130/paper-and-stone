import { z } from "zod";
import { normalizeHex } from "@/lib/colors/normalizeHex";
import { normalizeOptionalCode } from "@/lib/shared/normalize-code";
import type { AdminColorFormInput } from "@/types/admin-color";

export const COLOR_ERRORS = {
  DUPLICATE_CODE: "כבר קיים צבע עם קוד זה",
  INVALID_HEX: "ערך HEX לא תקין. השתמשו בפורמט #RRGGBB",
  GENERIC: "אירעה שגיאה בשמירת הצבע. נסו שוב.",
} as const;

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

export const colorInputSchema = z.object({
  nameHe: z.string().min(1, "נא להזין שם בעברית").max(200),
  nameEn: optionalString(200),
  code: optionalString(100),
  hex: z.string().min(1, "נא להזין ערך HEX"),
  sortOrder: z.coerce.number().int().min(0, "סדר חייב להיות 0 ומעלה"),
  isActive: z.boolean(),
});

export type ColorInput = z.infer<typeof colorInputSchema>;

export type ColorWriteFields = {
  nameHe: string;
  nameEn?: string;
  code?: string;
  hex: string;
  sortOrder: number;
  isActive: boolean;
};

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function mapColorInputToWriteFields(
  input: ColorInput,
): ColorWriteFields | { fieldErrors: Record<string, string> } {
  const normalizedHex = normalizeHex(input.hex);
  if (!normalizedHex) {
    return {
      fieldErrors: { hex: COLOR_ERRORS.INVALID_HEX },
    };
  }

  return {
    nameHe: input.nameHe.trim(),
    nameEn: emptyToUndefined(input.nameEn),
    code: normalizeOptionalCode(input.code),
    hex: normalizedHex,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };
}

export function formatColorZodErrors(
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

export function parseColorFormInput(
  input: AdminColorFormInput,
):
  | { success: true; data: ColorInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = colorInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: formatColorZodErrors(parsed.error).fieldErrors,
    };
  }

  return { success: true, data: parsed.data };
}
