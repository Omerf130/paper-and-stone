"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  approveArchitectRequest,
  declineArchitectRequest,
} from "@/lib/users/architect-request-mutations";
import { UserMutationError } from "@/lib/users/user-errors";
import { parseUserId, USER_ERRORS } from "@/lib/users/user-validation";
import type { UserMutationState } from "@/types/admin-user";

export async function approveArchitectRequestAction(
  userId: string,
): Promise<UserMutationState> {
  const admin = await requireAdmin();

  const parsedId = parseUserId(userId);
  if (!parsedId.success) {
    return { error: parsedId.error };
  }

  try {
    await approveArchitectRequest(admin, parsedId.data);
    revalidatePath("/admin/architect-requests");
    revalidatePath("/admin/client-requests");
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UserMutationError) {
      return { error: error.message };
    }

    return { error: USER_ERRORS.GENERIC };
  }
}

export async function declineArchitectRequestAction(
  userId: string,
): Promise<UserMutationState> {
  const admin = await requireAdmin();

  const parsedId = parseUserId(userId);
  if (!parsedId.success) {
    return { error: parsedId.error };
  }

  try {
    await declineArchitectRequest(admin, parsedId.data);
    revalidatePath("/admin/architect-requests");
    revalidatePath("/admin/client-requests");
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UserMutationError) {
      return { error: error.message };
    }

    return { error: USER_ERRORS.GENERIC };
  }
}
