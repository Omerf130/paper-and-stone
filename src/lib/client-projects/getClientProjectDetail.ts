import { getClientApprovedProjectSnapshotByProjectId } from "@/lib/client-snapshots/getClientApprovedProjectSnapshots";
import { getClientAssignedProjectMetadataById } from "@/lib/client-projects/getClientAssignedProjectsMetadata";
import {
  countSnapshotProductsFromView,
  mapClientProjectListItemView,
} from "@/lib/client-projects/mapClientProjectListItemView";
import { getClientProjectPresentationStateWithKind } from "@/lib/client-projects/client-project-presentation";
import { resolveArchitectFullNamesForClientProjects } from "@/lib/client-projects/resolveArchitectFullNamesForClientProjects";
import type { ClientProjectDetailView } from "@/types/client-project";

export async function getClientProjectDetail(
  clientUserId: string,
  projectId: string,
): Promise<ClientProjectDetailView | null> {
  const project = await getClientAssignedProjectMetadataById(
    clientUserId,
    projectId,
  );

  if (!project) {
    return null;
  }

  const snapshot = await getClientApprovedProjectSnapshotByProjectId(
    clientUserId,
    projectId,
  );

  const architectFullName = snapshot?.architect.fullName
    ?? (await resolveArchitectFullNamesForClientProjects([project.ownerUserId]))
      .get(project.ownerUserId)
    ?? "אדריכל";

  const isApprovedContentUnavailable =
    snapshot == null && project.status === "approved";

  const presentationState = getClientProjectPresentationStateWithKind({
    hasApprovedSnapshot: snapshot != null,
    isApprovedContentUnavailable,
    projectStatus: project.status,
    commercialDirty: project.commercialDirty,
    liveSubmissionRevision: project.submissionRevision,
    snapshotSubmissionRevision: snapshot?.submissionRevision,
  });

  if (!snapshot) {
    if (project.status === "approved") {
      console.error(
        "[client-project] approved project missing snapshot",
        { projectId, clientUserId },
      );

      return {
        kind: "snapshot-unavailable",
        projectId: project.projectId,
        projectName: project.projectName,
        architectFullName,
        presentationState,
      };
    }

    return {
      kind: "no-snapshot",
      projectId: project.projectId,
      projectName: project.projectName,
      architectFullName,
      presentationState,
    };
  }

  return {
    kind: "approved",
    projectId: project.projectId,
    presentationState,
    snapshot,
    roomCount: snapshot.rooms.length,
    productCount: countSnapshotProductsFromView(snapshot),
  };
}

export async function getClientProjectListItemForProject(
  clientUserId: string,
  projectId: string,
) {
  const project = await getClientAssignedProjectMetadataById(
    clientUserId,
    projectId,
  );

  if (!project) {
    return null;
  }

  const snapshot = await getClientApprovedProjectSnapshotByProjectId(
    clientUserId,
    projectId,
  );

  const architectNames = await resolveArchitectFullNamesForClientProjects([
    project.ownerUserId,
  ]);

  return mapClientProjectListItemView({
    project,
    snapshot,
    architectFullName:
      snapshot?.architect.fullName ??
      architectNames.get(project.ownerUserId) ??
      "אדריכל",
  });
}
