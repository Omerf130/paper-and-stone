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

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const registerSchema = z
  .object({
    email: emailField,
    password: passwordField,
    passwordConfirm: z.string().min(1, "נא לאשר את הסיסמה"),
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
