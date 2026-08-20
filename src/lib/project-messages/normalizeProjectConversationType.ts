import type { ProjectConversationType } from "@/types/project-message";

export function normalizeProjectConversationType(
  value: ProjectConversationType | null | undefined,
): ProjectConversationType {
  if (value === "architect_client") {
    return "architect_client";
  }

  return "admin_architect";
}

export function isAdminArchitectConversationType(
  value: ProjectConversationType | null | undefined,
): boolean {
  return normalizeProjectConversationType(value) === "admin_architect";
}
