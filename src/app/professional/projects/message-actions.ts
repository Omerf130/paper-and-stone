"use server";

import { revalidatePath } from "next/cache";
import { requireProfessional } from "@/lib/auth/authorization";
import { createProjectMessage } from "@/lib/project-messages/createProjectMessage";
import { markProjectMessagesRead } from "@/lib/project-messages/markProjectMessagesRead";
import {
  ProjectMessageMutationError,
  MESSAGE_ERRORS,
} from "@/lib/project-messages/message-errors";
import type { ProjectMessageActionState } from "@/types/project-message";

export async function sendProfessionalProjectMessageAction(
  projectId: string,
  body: string,
): Promise<ProjectMessageActionState> {
  const user = await requireProfessional();

  try {
    await createProjectMessage(user.id, "professional", projectId, body);
    revalidatePath(`/professional/projects/${projectId}`);
    revalidatePath("/professional/projects");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
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

export async function markProfessionalProjectMessagesReadAction(
  projectId: string,
): Promise<void> {
  const user = await requireProfessional();

  try {
    await markProjectMessagesRead(user.id, "professional", projectId);
    revalidatePath(`/professional/projects/${projectId}`);
    revalidatePath("/professional/projects");
  } catch {
    // Read marking is best-effort; do not surface errors to user.
  }
}
