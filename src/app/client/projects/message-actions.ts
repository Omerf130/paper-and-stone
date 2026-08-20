"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/auth/authorization";
import { createClientArchitectProjectMessage } from "@/lib/project-messages/createArchitectClientProjectMessage";
import { markClientArchitectMessagesRead } from "@/lib/project-messages/architect-client-messages";
import {
  ProjectMessageMutationError,
  MESSAGE_ERRORS,
} from "@/lib/project-messages/message-errors";
import type { ProjectMessageActionState } from "@/types/project-message";

function toActionState(error: unknown): ProjectMessageActionState {
  if (error instanceof ProjectMessageMutationError) {
    return {
      error: error.message,
      fieldErrors: error.fieldErrors,
    };
  }

  return { error: MESSAGE_ERRORS.GENERIC };
}

export async function sendClientArchitectProjectMessageAction(
  projectId: string,
  body: string,
): Promise<ProjectMessageActionState> {
  try {
    const user = await requireClient();
    await createClientArchitectProjectMessage(user.id, projectId, body);

    revalidatePath(`/client/projects/${projectId}`);
    revalidatePath("/client/projects");
    revalidatePath("/client");
    revalidatePath(`/professional/projects/${projectId}`);
    revalidatePath("/professional/projects");
    revalidatePath("/professional");
    revalidatePath(`/admin/projects/${projectId}`);

    return { success: true };
  } catch (error) {
    return toActionState(error);
  }
}

export async function markClientArchitectProjectMessagesReadAction(
  projectId: string,
): Promise<void> {
  const user = await requireClient();
  await markClientArchitectMessagesRead(user.id, projectId);

  revalidatePath(`/client/projects/${projectId}`);
  revalidatePath("/client/projects");
  revalidatePath("/client");
}
