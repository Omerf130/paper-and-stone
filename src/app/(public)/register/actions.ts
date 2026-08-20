"use server";

import { redirect } from "next/navigation";
import { AUTH_ERRORS } from "@/lib/auth/errors";
import { createSession } from "@/lib/auth/session";
import {
  createRegisteredUser,
  emailExists,
} from "@/lib/auth/user-service";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";
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
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    identificationNumber: formData.get("identificationNumber"),
    userType: formData.get("userType"),
  });

  if (!parsed.success) {
    return formatZodErrors(parsed.error);
  }

  if (await emailExists(parsed.data.email)) {
    return { error: AUTH_ERRORS.DUPLICATE_EMAIL };
  }

  const user = await createRegisteredUser(parsed.data);

  await createSession(user._id.toString());

  if (parsed.data.userType === "architect") {
    redirect("/client?registered=architect-request");
  }

  redirect(resolvePostAuthRedirect("client"));
}
