import { z } from "zod";
import { normalizeOptionalCode } from "@/lib/shared/normalize-code";
import { MATERIAL_TYPES } from "@/types/material";
import type { AdminMaterialFormInput } from "@/types/admin-material";

export const MATERIAL_ERRORS = {
  DUPLICATE_CODE: "כבר קיים חומר עם קוד זה",
  GENERIC: "אירעה שגיאה בשמירת החומר. נסו שוב.",
} as const;

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

export const materialInputSchema = z.object({
  nameHe: z.string().min(1, "נא להזין שם בעברית").max(200),
  nameEn: optionalString(200),
  code: optionalString(100),
  type: z.enum(MATERIAL_TYPES),
  sortOrder: z.coerce.number().int().min(0, "סדר חייב להיות 0 ומעלה"),
  isActive: z.boolean(),
  colorIds: z.array(z.string()),
});

export type MaterialInput = z.infer<typeof materialInputSchema>;

export type MaterialWriteFields = {
  nameHe: string;
  nameEn?: string;
  code?: string;
  type: MaterialInput["type"];
  sortOrder: number;
  isActive: boolean;
  colorIds: string[];
};

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function mapMaterialInputToWriteFields(
  input: MaterialInput,
  verifiedColorIds: string[],
): MaterialWriteFields {
  return {
    nameHe: input.nameHe.trim(),
    nameEn: emptyToUndefined(input.nameEn),
    code: normalizeOptionalCode(input.code),
    type: input.type,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    colorIds: verifiedColorIds,
  };
}

export function formatMaterialZodErrors(
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
