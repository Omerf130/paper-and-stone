import { z } from "zod";
import type { ProfessionalProfileFormInput } from "@/types/professional-profile";

export const PROFILE_ERRORS = {
  GENERIC: "אירעה שגיאה בשמירת הפרופיל. נסו שוב.",
} as const;

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    });

const phonePattern = /^[\d+\-\s()]*$/;

export const professionalProfileInputSchema = z.object({
  fullName: optionalTrimmedString(120),
  phone: z
    .string()
    .max(30)
    .optional()
    .or(z.literal(""))
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    })
    .refine((value) => !value || phonePattern.test(value), {
      message: "מספר טלפון אינו תקין",
    }),
  companyName: optionalTrimmedString(120),
  city: optionalTrimmedString(80),
  bio: optionalTrimmedString(500),
});

export type ProfessionalProfileWriteFields = {
  fullName?: string;
  phone?: string;
  companyName?: string;
  city?: string;
  bio?: string;
};

export function formatProfileZodErrors(
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

export function parseProfessionalProfileFormInput(
  input: ProfessionalProfileFormInput,
):
  | { success: true; data: ProfessionalProfileWriteFields }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = professionalProfileInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: formatProfileZodErrors(parsed.error).fieldErrors,
    };
  }

  return { success: true, data: parsed.data };
}
