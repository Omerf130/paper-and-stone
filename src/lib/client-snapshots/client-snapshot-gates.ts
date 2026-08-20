import type { IProject, IProjectItem } from "@/models/Project";
import type { IProjectRoom } from "@/models/ProjectRoom";
import { getLayeredPricingApprovalBlockedReason } from "@/lib/pricing/pricing-gates";
import { usesLayeredPricing, usesRoomBasedWorkspace } from "@/lib/projects/project-workspace-gates";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { CLIENT_SNAPSHOT_ERRORS } from "@/lib/client-snapshots/client-snapshot-errors";

export function assertAssignedClientForCommercialApproval(
  project: Pick<IProject, "clientUserId">,
): void {
  if (!project.clientUserId) {
    throw new ProjectMutationError(CLIENT_SNAPSHOT_ERRORS.CLIENT_REQUIRED_FOR_APPROVAL);
  }
}

export function assertItemsAssignedToValidRooms(
  items: IProjectItem[],
  rooms: IProjectRoom[],
): void {
  const roomIds = new Set(rooms.map((room) => room._id.toString()));

  for (const item of items) {
    const roomId = item.roomId?.toString();

    if (!roomId || !roomIds.has(roomId)) {
      throw new ProjectMutationError(CLIENT_SNAPSHOT_ERRORS.ORPHAN_ITEMS_NOT_IN_ROOM);
    }
  }
}

export function assertCommercialApprovalSnapshotPreconditions(
  project: Pick<IProject, "onboardingStatus" | "items" | "clientUserId">,
  rooms: IProjectRoom[],
): void {
  if (!usesLayeredPricing(project)) {
    return;
  }

  assertAssignedClientForCommercialApproval(project);

  if (usesRoomBasedWorkspace(project)) {
    assertItemsAssignedToValidRooms(project.items, rooms);
  }
}

export function getCommercialApprovalBlockedReason(
  project: Pick<IProject, "onboardingStatus" | "items" | "clientUserId">,
  rooms: IProjectRoom[] = [],
): string | null {
  if (!usesLayeredPricing(project)) {
    return null;
  }

  const pricingReason = getLayeredPricingApprovalBlockedReason(project);
  if (pricingReason) {
    return pricingReason;
  }

  if (!project.clientUserId) {
    return CLIENT_SNAPSHOT_ERRORS.CLIENT_REQUIRED_FOR_APPROVAL;
  }

  if (usesRoomBasedWorkspace(project)) {
    const roomIds = new Set(rooms.map((room) => room._id.toString()));

    for (const item of project.items) {
      const roomId = item.roomId?.toString();
      if (!roomId || !roomIds.has(roomId)) {
        return CLIENT_SNAPSHOT_ERRORS.ORPHAN_ITEMS_NOT_IN_ROOM;
      }
    }
  }

  return null;
}
