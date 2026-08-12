"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  updateUserActiveStatus,
  updateUserRole,
} from "@/lib/users/user-mutations";
import { UserMutationError } from "@/lib/users/user-errors";
import {
  parseActiveStatus,
  parseUserId,
  parseUserRole,
  USER_ERRORS,
} from "@/lib/users/user-validation";
import type { UserMutationState } from "@/types/admin-user";

export async function updateUserRoleAction(
  userId: string,
  role: unknown,
): Promise<UserMutationState> {
  const currentAdmin = await requireAdmin();

  const parsedId = parseUserId(userId);
  if (!parsedId.success) {
    return { error: parsedId.error };
  }

  const parsedRole = parseUserRole(role);
  if (!parsedRole.success) {
    return { error: parsedRole.error };
  }

  try {
    await updateUserRole(currentAdmin, parsedId.data, parsedRole.data);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UserMutationError) {
      return { error: error.message };
    }

    return { error: USER_ERRORS.GENERIC };
  }
}

export async function updateUserActiveStatusAction(
  userId: string,
  isActive: unknown,
): Promise<UserMutationState> {
  const currentAdmin = await requireAdmin();

  const parsedId = parseUserId(userId);
  if (!parsedId.success) {
    return { error: parsedId.error };
  }

  const parsedStatus = parseActiveStatus(isActive);
  if (!parsedStatus.success) {
    return { error: parsedStatus.error };
  }

  try {
    await updateUserActiveStatus(
      currentAdmin,
      parsedId.data,
      parsedStatus.data,
    );
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UserMutationError) {
      return { error: error.message };
    }

    return { error: USER_ERRORS.GENERIC };
  }
}
