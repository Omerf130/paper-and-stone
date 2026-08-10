"use server";

import { redirect } from "next/navigation";
import { AUTH_ERRORS } from "@/lib/auth/errors";
import { createSession } from "@/lib/auth/session";
import {
  createCustomerUser,
  emailExists,
} from "@/lib/auth/user-service";
import {
  type AuthFormState,
  formatZodErrors,
  registerSchema,
} from "@/lib/auth/validation";

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!parsed.success) {
    return formatZodErrors(parsed.error);
  }

  if (await emailExists(parsed.data.email)) {
    return { error: AUTH_ERRORS.DUPLICATE_EMAIL };
  }

  const user = await createCustomerUser(
    parsed.data.email,
    parsed.data.password,
  );

  await createSession(user._id.toString());
  redirect("/");
}
