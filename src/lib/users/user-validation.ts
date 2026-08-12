import { Types } from "mongoose";
import { z } from "zod";
import type { UserRole } from "@/types/user";

export const USER_ERRORS = {
  GENERIC: "אירעה שגיאה בעדכון המשתמש. נסו שוב.",
  NOT_FOUND: "המשתמש לא נמצא.",
  INVALID_ID: "מזהה משתמש לא תקין.",
  INVALID_ROLE: "תפקיד לא תקין.",
} as const;

export const userRoleSchema = z.enum(["customer", "professional", "admin"]);

export const userIdSchema = z
  .string()
  .min(1, USER_ERRORS.INVALID_ID)
  .refine((value) => Types.ObjectId.isValid(value), USER_ERRORS.INVALID_ID);

export function parseUserRole(value: unknown):
  | { success: true; data: UserRole }
  | { success: false; error: string } {
  const parsed = userRoleSchema.safeParse(value);

  if (!parsed.success) {
    return { success: false, error: USER_ERRORS.INVALID_ROLE };
  }

  return { success: true, data: parsed.data };
}

export function parseUserId(value: unknown):
  | { success: true; data: string }
  | { success: false; error: string } {
  const parsed = userIdSchema.safeParse(value);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? USER_ERRORS.INVALID_ID,
    };
  }

  return { success: true, data: parsed.data };
}

export function parseActiveStatus(value: unknown):
  | { success: true; data: boolean }
  | { success: false; error: string } {
  if (typeof value !== "boolean") {
    return { success: false, error: USER_ERRORS.GENERIC };
  }

  return { success: true, data: value };
}
