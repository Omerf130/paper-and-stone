"use server";

import { redirect } from "next/navigation";
import { AUTH_ERRORS } from "@/lib/auth/errors";
import { createSession } from "@/lib/auth/session";
import { authenticateUser } from "@/lib/auth/user-service";
import { normalizeUserRole } from "@/lib/auth/user-role";
import { resolvePostAuthDestination } from "@/lib/auth/account-access";
import { resolveSafeNextUrl } from "@/lib/auth/safe-next-url";
import { normalizeAccountStatus, isUserAccountApproved } from "@/lib/users/account-status";
import {
  type AuthFormState,
  formatZodErrors,
  loginSchema,
} from "@/lib/auth/validation";

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return formatZodErrors(parsed.error);
  }

  const user = await authenticateUser(parsed.data.email, parsed.data.password);

  if (!user) {
    return { error: AUTH_ERRORS.INVALID_CREDENTIALS };
  }

  await createSession(user._id.toString());

  const next = resolveSafeNextUrl(formData.get("next")?.toString());
  const accountStatus = normalizeAccountStatus(user.accountStatus);
  const role = normalizeUserRole(user.role);

  if (next && isUserAccountApproved({ accountStatus })) {
    redirect(next);
  }

  redirect(resolvePostAuthDestination({ role, accountStatus }));
}
