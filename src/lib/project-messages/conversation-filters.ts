import type { ProjectConversationType } from "@/types/project-message";

export const ADMIN_ARCHITECT_CONVERSATION_FILTER = {
  $or: [
    { conversationType: "admin_architect" as const },
    { conversationType: { $exists: false } },
    { conversationType: null },
  ],
};

export function buildArchitectClientConversationFilter(input: {
  clientUserIdAtSend: string;
}): Record<string, unknown> {
  return {
    conversationType: "architect_client" satisfies ProjectConversationType,
    clientUserIdAtSend: input.clientUserIdAtSend,
  };
}
