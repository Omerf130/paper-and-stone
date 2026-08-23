import { z } from "zod";
import { isKnownProjectItemStatus } from "@/lib/project-items/project-item-status-presentation";
import {
  PROJECT_ITEM_STATUSES,
  type ProjectItemStatus,
  type ProjectItemWorkflowTransition,
} from "@/types/project-item-status";

export const PROJECT_ITEM_STATUS_ERRORS = {
  INVALID_STATUS: "סטטוס מוצר לא תקין",
  SAME_STATUS: "המוצר כבר בסטטוס זה",
  TRANSITION_NOT_ALLOWED: "מעבר הסטטוס אינו מותר",
  ITEM_NOT_FOUND: "המוצר לא נמצא בפרויקט",
  PROJECT_NOT_FOUND: "הפרויקט לא נמצא",
  NOT_AUTHORIZED: "אין הרשאה לעדכן סטטוס מוצר",
  NOT_IN_CLIENT_SNAPSHOT: "המוצר אינו זמין לפעולה במסגרת הגרסה המאושרת",
  INVALID_TRANSITION: "הגדרת מעבר סטטוס לא תקינה",
  DUPLICATE_TRANSITION: "מעבר סטטוס כפול",
  SETTINGS_NOT_EDITABLE: "אין הרשאה לעדכן הגדרות תהליך",
} as const;

const workflowTransitionRoleSchema = z.enum(["architect", "client"]);

const workflowTransitionSchema = z.object({
  from: z.enum(PROJECT_ITEM_STATUSES),
  to: z.enum(PROJECT_ITEM_STATUSES),
  allowedRoles: z.array(workflowTransitionRoleSchema),
});

export const projectItemWorkflowSettingsInputSchema = z.object({
  transitions: z.array(workflowTransitionSchema).min(1),
});

export function parseProjectItemStatusInput(
  value: string,
): ProjectItemStatus | null {
  return isKnownProjectItemStatus(value) ? value : null;
}

export function validateWorkflowTransitions(
  transitions: ProjectItemWorkflowTransition[],
): { ok: true } | { ok: false; error: string } {
  const parsed = projectItemWorkflowSettingsInputSchema.safeParse({ transitions });

  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ??
        PROJECT_ITEM_STATUS_ERRORS.INVALID_TRANSITION,
    };
  }

  const seen = new Set<string>();

  for (const transition of transitions) {
    const key = `${transition.from}->${transition.to}`;

    if (seen.has(key)) {
      return { ok: false, error: PROJECT_ITEM_STATUS_ERRORS.DUPLICATE_TRANSITION };
    }

    seen.add(key);
  }

  return { ok: true };
}
