import type { ClientApprovedProjectView } from "@/types/client-approved-project";

export function collectSnapshotProjectItemIds(
  snapshot: ClientApprovedProjectView,
): string[] {
  return snapshot.rooms.flatMap((room) =>
    room.items.map((item) => item.projectItemId),
  );
}

export function collectSnapshotProjectItemIdsByProjectId(
  snapshotsByProjectId: Map<string, ClientApprovedProjectView>,
): Map<string, string[]> {
  const result = new Map<string, string[]>();

  for (const [projectId, snapshot] of snapshotsByProjectId) {
    result.set(projectId, collectSnapshotProjectItemIds(snapshot));
  }

  return result;
}
