import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project, { type IProject } from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";
import { getProjectRoomsForProject } from "@/lib/projects/project-room-queries";
import { loadProductThumbnailMap } from "@/lib/products/loadProductThumbnailMap";
import { usesLayeredPricing } from "@/lib/projects/project-workspace-gates";
import { assertCommercialApprovalSnapshotPreconditions } from "@/lib/client-snapshots/client-snapshot-gates";
import { buildApprovedClientProjectSnapshot } from "@/lib/client-snapshots/buildApprovedClientProjectSnapshot";
import { resolveArchitectFullNameForSnapshot } from "@/lib/client-snapshots/resolveArchitectFullNameForSnapshot";
import {
  deleteClientApprovedProjectSnapshot,
  getClientApprovedProjectSnapshotDocument,
  restoreClientApprovedProjectSnapshot,
  upsertClientApprovedProjectSnapshot,
} from "@/lib/client-snapshots/client-approved-project-snapshot-repository";
import { CLIENT_SNAPSHOT_ERRORS } from "@/lib/client-snapshots/client-snapshot-errors";

async function rollbackClientSnapshotAfterApprovalFailure(
  projectId: string,
  previousSnapshot: Awaited<
    ReturnType<typeof getClientApprovedProjectSnapshotDocument>
  >,
  approvalError: unknown,
): Promise<never> {
  try {
    if (previousSnapshot) {
      await restoreClientApprovedProjectSnapshot(previousSnapshot);
    } else {
      await deleteClientApprovedProjectSnapshot(projectId);
    }
  } catch (rollbackError) {
    console.error("Client snapshot approval failed:", approvalError);
    console.error("Client snapshot rollback failed:", rollbackError);
    throw new ProjectMutationError(CLIENT_SNAPSHOT_ERRORS.SNAPSHOT_ROLLBACK_FAILED);
  }

  if (approvalError instanceof ProjectMutationError) {
    throw approvalError;
  }

  throw approvalError;
}

export async function createClientSnapshotForCommercialApproval(
  project: IProject,
): Promise<void> {
  const projectId = project._id.toString();
  const rooms = await getProjectRoomsForProject(projectId);

  assertCommercialApprovalSnapshotPreconditions(project, rooms);

  const productIds = [...new Set(project.items.map((item) => item.productId.toString()))];
  const [architectFullName, productThumbnailsById] = await Promise.all([
    resolveArchitectFullNameForSnapshot(project.ownerUserId.toString()),
    loadProductThumbnailMap(productIds),
  ]);

  const approvedAt = new Date();
  const payload = buildApprovedClientProjectSnapshot({
    project,
    rooms,
    architectFullName,
    productThumbnailsById,
    approvedAt,
  });

  await upsertClientApprovedProjectSnapshot(payload);
}

export async function approveLayeredProjectWithClientSnapshot(
  adminUserId: string,
  projectId: string,
  applyApproval: () => Promise<void>,
): Promise<void> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (!usesLayeredPricing(project)) {
    await applyApproval();
    return;
  }

  const previousSnapshot = await getClientApprovedProjectSnapshotDocument(projectId);

  try {
    await createClientSnapshotForCommercialApproval(project);
    await applyApproval();
  } catch (error: unknown) {
    console.error("[commercial-approval] snapshot/approval failed", {
      projectId,
      error,
    });
    await rollbackClientSnapshotAfterApprovalFailure(
      projectId,
      previousSnapshot,
      error,
    );
  }
}
