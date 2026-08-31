import { z } from "zod";
import { normalizeEmail } from "@/lib/auth/validation";

const fullNameField = z
  .string()
  .min(1, "נא להזין שם מלא")
  .transform((value) => value.trim())
  .pipe(z.string().min(2, "שם מלא קצר מדי").max(120, "שם מלא ארוך מדי"));

const identificationNumberField = z
  .string()
  .min(1, "נא להזין ח.פ / ת.ז")
  .transform((value) => value.trim())
  .pipe(z.string().min(3, "מספר זיהוי קצר מדי").max(20, "מספר זיהוי ארוך מדי"));

const passwordField = z
  .string()
  .min(1, "נא להזין סיסמה")
  .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
  .max(128, "הסיסמה ארוכה מדי");

export const adminCreateUserInputSchema = z
  .object({
    fullName: fullNameField,
    email: z
      .string()
      .min(1, "נא להזין כתובת מייל")
      .email("כתובת המייל אינה תקינה")
      .transform(normalizeEmail),
    identificationNumber: identificationNumberField,
    initialPassword: passwordField,
    initialPasswordConfirm: z.string().min(1, "נא לאשר את הסיסמה"),
  })
  .refine((data) => data.initialPassword === data.initialPasswordConfirm, {
    message: "הסיסמאות אינן תואמות",
    path: ["initialPasswordConfirm"],
  });

export type AdminCreateUserInput = z.infer<typeof adminCreateUserInputSchema>;

export function parseAdminCreateUserInput(input: unknown):
  | { success: true; data: AdminCreateUserInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = adminCreateUserInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, fieldErrors };
  }
  return { success: true, data: parsed.data };
}

export const ADMIN_CREATE_USER_LIMITATION =
  "הסיסמה הראשונית נקבעת על ידי האדמין. אין כרגע מנגנון שינוי סיסמה בכניסה הראשונה — יש להעביר את הסיסמה ללקוח/אדריכל בערוץ מאובטח.";
