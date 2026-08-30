import { z } from "zod";
import { normalizeOptionalCode } from "@/lib/shared/normalize-code";
import type { AdminSupplierFormInput } from "@/types/admin-supplier";

export const SUPPLIER_ERRORS = {
  DUPLICATE_CODE: "כבר קיים ספק עם קוד זה",
  INVALID_SUPPLIER: "הספק שנבחר אינו תקין",
  REQUIRED: "נא לבחור ספק",
  GENERIC: "אירעה שגיאה בשמירת הספק. נסו שוב.",
} as const;

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

export const supplierInputSchema = z.object({
  name: z.string().min(1, "נא להזין שם ספק").max(200),
  code: optionalString(100),
  isActive: z.boolean(),
});

export type SupplierInput = z.infer<typeof supplierInputSchema>;

export type SupplierWriteFields = {
  name: string;
  code?: string;
  isActive: boolean;
};

export function mapSupplierInputToWriteFields(
  input: SupplierInput,
): SupplierWriteFields {
  return {
    name: input.name.trim(),
    code: normalizeOptionalCode(input.code),
    isActive: input.isActive,
  };
}

export function formatSupplierZodErrors(
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

export function parseSupplierFormInput(
  input: AdminSupplierFormInput,
):
  | { success: true; data: SupplierInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = supplierInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: formatSupplierZodErrors(parsed.error).fieldErrors,
    };
  }

  return { success: true, data: parsed.data };
}
