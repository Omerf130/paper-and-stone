import { z } from "zod";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const emailField = z
  .string()
  .min(1, "נא להזין כתובת מייל")
  .email("כתובת המייל אינה תקינה")
  .transform(normalizeEmail);

const passwordField = z
  .string()
  .min(1, "נא להזין סיסמה")
  .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
  .max(128, "הסיסמה ארוכה מדי");

const fullNameField = z
  .string()
  .min(1, "נא להזין שם מלא")
  .transform((value) => value.trim())
  .pipe(
    z
      .string()
      .min(2, "שם מלא קצר מדי")
      .max(120, "שם מלא ארוך מדי"),
  );

const identificationNumberField = z
  .string()
  .min(1, "נא להזין ח.פ / ת.ז")
  .transform((value) => value.trim())
  .pipe(
    z
      .string()
      .min(3, "מספר זיהוי קצר מדי")
      .max(20, "מספר זיהוי ארוך מדי"),
  );

const userTypeField = z.enum(["client", "architect"], {
  message: "נא לבחור סוג משתמש",
});

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const registerSchema = z
  .object({
    fullName: fullNameField,
    email: emailField,
    password: passwordField,
    passwordConfirm: z.string().min(1, "נא לאשר את הסיסמה"),
    identificationNumber: identificationNumberField,
    userType: userTypeField,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "הסיסמאות אינן תואמות",
    path: ["passwordConfirm"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export function formatZodErrors(
  error: z.ZodError,
): Pick<AuthFormState, "error" | "fieldErrors"> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return { fieldErrors };
}
