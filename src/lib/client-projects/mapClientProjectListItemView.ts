import type { ClientApprovedProjectView } from "@/types/client-approved-project";
import type {
  ClientAssignedProjectMetadata,
  ClientProjectListItemView,
} from "@/types/client-project";
import { getClientProjectPresentationStateWithKind } from "@/lib/client-projects/client-project-presentation";

function countSnapshotProducts(snapshot: ClientApprovedProjectView): number {
  return snapshot.rooms.reduce(
    (total, room) => total + room.items.length,
    0,
  );
}

export function mapClientProjectListItemView(input: {
  project: ClientAssignedProjectMetadata;
  snapshot?: ClientApprovedProjectView | null;
  architectFullName: string;
  unreadMessageCount?: number;
}): ClientProjectListItemView {
  const hasApprovedSnapshot = input.snapshot != null;
  const isApprovedContentUnavailable =
    !hasApprovedSnapshot && input.project.status === "approved";
  const presentationState = getClientProjectPresentationStateWithKind({
    hasApprovedSnapshot,
    isApprovedContentUnavailable,
    projectStatus: input.project.status,
    commercialDirty: input.project.commercialDirty,
    liveSubmissionRevision: input.project.submissionRevision,
    snapshotSubmissionRevision: input.snapshot?.submissionRevision,
  });

  const base: ClientProjectListItemView = {
    projectId: input.project.projectId,
    projectName: input.project.projectName,
    presentationState,
    architectFullName: input.architectFullName,
    hasApprovedSnapshot,
    unreadMessageCount: input.unreadMessageCount,
  };

  if (!input.snapshot) {
    return base;
  }

  return {
    ...base,
    approvedAt: input.snapshot.approvedAt,
    roomCount: input.snapshot.rooms.length,
    productCount: countSnapshotProducts(input.snapshot),
    clientProjectTotalAgorot: input.snapshot.clientProjectTotalAgorot,
  };
}

export function countSnapshotProductsFromView(
  snapshot: ClientApprovedProjectView,
): number {
  return countSnapshotProducts(snapshot);
}
