"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";
import { revalidateProfessionalNotificationSurfaces } from "@/lib/notifications/revalidate-professional-notification-surfaces";
import { createProjectMessage } from "@/lib/project-messages/createProjectMessage";
import { markProjectMessagesRead } from "@/lib/project-messages/markProjectMessagesRead";
import {
  ProjectMessageMutationError,
  MESSAGE_ERRORS,
} from "@/lib/project-messages/message-errors";
import type { ProjectMessageActionState } from "@/types/project-message";

export async function sendAdminProjectMessageAction(
  projectId: string,
  body: string,
): Promise<ProjectMessageActionState> {
  const user = await requireAdmin();

  try {
    await createProjectMessage(user.id, "admin", projectId, body);
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath("/admin/projects");
    revalidatePath(`/professional/projects/${projectId}`);
    revalidatePath("/professional/projects");
    revalidateProfessionalNotificationSurfaces();
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMessageMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: MESSAGE_ERRORS.GENERIC };
  }
}

export async function markAdminProjectMessagesReadAction(
  projectId: string,
): Promise<void> {
  const user = await requireAdmin();

  try {
    await markProjectMessagesRead(user.id, "admin", projectId);
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath("/admin/projects");
  } catch {
    // Read marking is best-effort; do not surface errors to user.
  }
}
