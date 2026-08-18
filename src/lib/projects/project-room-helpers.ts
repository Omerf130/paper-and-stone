import type { IProjectItem } from "@/models/Project";
import type { IProjectRoom } from "@/models/ProjectRoom";
import type { ProjectRoomView } from "@/types/project-room";

export function computeRoomItemCounts(
  rooms: Array<Pick<IProjectRoom, "_id">>,
  items: Array<Pick<IProjectItem, "roomId">>,
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const room of rooms) {
    counts.set(room._id.toString(), 0);
  }

  for (const item of items) {
    const roomId = item.roomId?.toString();
    if (!roomId) {
      continue;
    }

    counts.set(roomId, (counts.get(roomId) ?? 0) + 1);
  }

  return counts;
}

export function mapProjectRoomToView(
  room: IProjectRoom,
  itemCount: number,
): ProjectRoomView {
  return {
    id: room._id.toString(),
    projectId: room.projectId.toString(),
    name: room.name,
    order: room.order,
    itemCount,
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
  };
}

export function groupItemsByRoomId<T extends { roomId?: string | null }>(
  items: T[],
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    if (!item.roomId) {
      continue;
    }

    const existing = grouped.get(item.roomId) ?? [];
    existing.push(item);
    grouped.set(item.roomId, existing);
  }

  return grouped;
}

export function resolveSelectedRoomId(
  rooms: ProjectRoomView[],
  requestedRoomId: string | null | undefined,
): string | null {
  if (rooms.length === 0) {
    return null;
  }

  if (
    requestedRoomId &&
    rooms.some((room) => room.id === requestedRoomId)
  ) {
    return requestedRoomId;
  }

  const sorted = [...rooms].sort((a, b) => a.order - b.order);
  return sorted[0]?.id ?? null;
}

export function projectHasItemsInRoom(
  items: Array<Pick<IProjectItem, "roomId">>,
  roomId: string,
): boolean {
  return items.some((item) => item.roomId?.toString() === roomId);
}
