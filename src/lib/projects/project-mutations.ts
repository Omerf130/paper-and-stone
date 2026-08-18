import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project, { type IProject, type IProjectItem } from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  MAX_PROJECT_ITEM_QUANTITY,
  PROJECT_ERRORS,
  type ProjectCreateFields,
  type ProjectWriteFields,
} from "@/lib/projects/project-validation";
import {
  assertProjectDeletable,
  assertProjectItemEditable,
  assertProjectMetadataEditable,
  EDITABLE_STATUS_FILTER,
} from "@/lib/projects/assertProjectEditable";
import { buildProjectItemSnapshot } from "@/lib/projects/buildProjectItemSnapshot";
import { createInitialItemPricing } from "@/lib/pricing/pricing-item-helpers";
import {
  buildElemMatchCriteria,
  buildProjectItemSelectionKey,
  projectItemsMatchSelection,
} from "@/lib/projects/project-item-matching";
import { verifyProjectItemSelectionForAdd, verifyProjectItemSelectionForEdit } from "@/lib/projects/verifyProjectItemSelection";
import { getMyProfessionalProfileView } from "@/lib/professionals/ensureProfessionalProfile";
import { isProfileReadyForProjects } from "@/lib/professionals/profile-readiness";
import { buildReviewHistoryEntry } from "@/lib/projects/project-review-history";
import {
  isLegacyProject,
  isProjectItemEditable,
  isProjectOnboardingDeletable,
  usesRoomBasedWorkspace,
  usesLayeredPricing,
} from "@/lib/projects/project-workspace-gates";
import { verifyRoomBelongsToProject } from "@/lib/projects/project-room-mutations";
import { PROJECT_ROOM_ERRORS } from "@/types/project-room";

async function assertProfileReadyForProjects(userId: string): Promise<void> {
  const profile = await getMyProfessionalProfileView(userId);

  if (!isProfileReadyForProjects(profile)) {
    throw new ProjectMutationError(PROJECT_ERRORS.PROFILE_NOT_READY);
  }
}

async function getOwnedProject(
  ownerUserId: string,
  projectId: string,
) {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  return Project.findOne({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
  });
}

async function getItemEditableOwnedProject(
  ownerUserId: string,
  projectId: string,
) {
  const project = await getOwnedProject(ownerUserId, projectId);
  return assertProjectItemEditable(project);
}

async function getMetadataEditableOwnedProject(
  ownerUserId: string,
  projectId: string,
) {
  const project = await getOwnedProject(ownerUserId, projectId);
  return assertProjectMetadataEditable(project);
}

function buildItemEditableFilter(projectId: string, ownerUserId: string) {
  return {
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
    status: EDITABLE_STATUS_FILTER,
    $or: [
      { onboardingStatus: null },
      { onboardingStatus: { $exists: false } },
      { onboardingStatus: "active" as const },
    ],
  };
}

export async function createProject(
  ownerUserId: string,
  fields: ProjectCreateFields,
): Promise<string> {
  await assertProfileReadyForProjects(ownerUserId);
  await connectDB();

  const historyEntry = buildReviewHistoryEntry({
    action: "onboarding_created",
    fromStatus: "draft",
    toStatus: "draft",
    actorUserId: ownerUserId,
    actorRole: "professional",
  });

  const project = await Project.create({
    ownerUserId: new Types.ObjectId(ownerUserId),
    name: fields.name,
    location: fields.location,
    description: fields.description,
    status: "draft",
    onboardingStatus: "pending_approval",
    clientUserId: null,
    items: [],
    reviewHistory: [historyEntry],
  });

  return project._id.toString();
}

export async function updateProject(
  ownerUserId: string,
  projectId: string,
  fields: ProjectWriteFields,
): Promise<void> {
  const project = await getMetadataEditableOwnedProject(ownerUserId, projectId);

  const updateFields: Record<string, string | null | undefined> = {
    name: fields.name,
    location: fields.location ?? null,
    description: fields.description ?? null,
  };

  if (isLegacyProject(project) && "clientName" in fields) {
    updateFields.clientName = fields.clientName ?? null;
  }

  const result = await Project.updateOne(
    {
      _id: new Types.ObjectId(projectId),
      ownerUserId: new Types.ObjectId(ownerUserId),
    },
    {
      $set: updateFields,
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }
}

export async function deleteProject(
  ownerUserId: string,
  projectId: string,
): Promise<void> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
  });

  assertProjectDeletable(project);

  const deleteFilter: Record<string, unknown> = {
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
  };

  if (project && isLegacyProject(project)) {
    deleteFilter.status = "draft";
  } else if (project) {
    deleteFilter.onboardingStatus = {
      $in: ["pending_approval", "rejected"],
    };
    deleteFilter.onboardingApprovedAt = { $exists: false };
  }

  const result = await Project.deleteOne(deleteFilter);

  if (result.deletedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_DELETABLE);
  }
}

function buildNewProjectItem(
  verified: Awaited<ReturnType<typeof verifyProjectItemSelectionForAdd>>,
  quantity: number,
  roomId?: Types.ObjectId | null,
  project?: Pick<
    IProject,
    "defaultAdminMarkupBp" | "defaultArchitectMarkupBp" | "onboardingStatus"
  >,
): IProjectItem {
  const snapshot = buildProjectItemSnapshot(verified.productView, verified);
  const pricing =
    project && usesLayeredPricing(project)
      ? createInitialItemPricing({
          defaultInternalCostAgorot: verified.defaultInternalCostAgorot,
          project,
        })
      : undefined;

  return {
    _id: new Types.ObjectId(),
    productId: new Types.ObjectId(verified.productId),
    roomId: roomId ?? null,
    selectedMaterialId: verified.selectedMaterialId,
    selectedColorId: verified.selectedColorId,
    selectedSizeKey: verified.selectedSizeKey,
    quantity,
    snapshot,
    ...(pricing ? { pricing } : {}),
  };
}

export async function addProductToProject(
  ownerUserId: string,
  projectId: string,
  productSlug: string,
  quantity: number,
  selectedMaterialId?: string,
  selectedColorId?: string,
  selectedSizeKey?: string,
  roomId?: string,
): Promise<void> {
  await assertProfileReadyForProjects(ownerUserId);
  const project = await getItemEditableOwnedProject(ownerUserId, projectId);

  if (!isProjectItemEditable(project)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_EDITABLE);
  }

  let roomObjectId: Types.ObjectId | null = null;

  if (usesRoomBasedWorkspace(project)) {
    if (!roomId?.trim()) {
      throw new ProjectMutationError(PROJECT_ROOM_ERRORS.ROOM_REQUIRED);
    }

    await verifyRoomBelongsToProject(projectId, roomId);
    roomObjectId = new Types.ObjectId(roomId);
  }

  const verified = await verifyProjectItemSelectionForAdd(
    productSlug,
    selectedMaterialId,
    selectedColorId,
    selectedSizeKey,
  );

  const selectionKey = buildProjectItemSelectionKey(
    new Types.ObjectId(verified.productId),
    selectedMaterialId,
    selectedColorId,
    selectedSizeKey,
    roomObjectId,
  );

  const editableFilter = buildItemEditableFilter(projectId, ownerUserId);

  const incrementResult = await Project.updateOne(
    {
      ...editableFilter,
      items: {
        $elemMatch: {
          ...buildElemMatchCriteria(selectionKey),
          quantity: { $lte: MAX_PROJECT_ITEM_QUANTITY - quantity },
        },
      },
    },
    {
      $inc: { "items.$.quantity": quantity },
    },
  );

  if (incrementResult.modifiedCount > 0) {
    return;
  }

  const existingProject = await Project.findOne(editableFilter);

  if (!existingProject) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const existingItem = existingProject.items.find((item) =>
    projectItemsMatchSelection(item, selectionKey),
  );

  if (existingItem) {
    if (existingItem.quantity + quantity > MAX_PROJECT_ITEM_QUANTITY) {
      throw new ProjectMutationError(PROJECT_ERRORS.QUANTITY_EXCEEDS_MAX);
    }

    const retryResult = await Project.updateOne(
      {
        ...editableFilter,
        items: {
          $elemMatch: {
            ...buildElemMatchCriteria(selectionKey),
            quantity: { $lte: MAX_PROJECT_ITEM_QUANTITY - quantity },
          },
        },
      },
      {
        $inc: { "items.$.quantity": quantity },
      },
    );

    if (retryResult.modifiedCount > 0) {
      return;
    }

    throw new ProjectMutationError(PROJECT_ERRORS.QUANTITY_EXCEEDS_MAX);
  }

  const newItem = buildNewProjectItem(verified, quantity, roomObjectId, project);

  const pushResult = await Project.updateOne(editableFilter, {
    $push: { items: newItem },
  });

  if (pushResult.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }
}

export async function updateProjectItem(
  ownerUserId: string,
  projectId: string,
  itemId: string,
  quantity: number,
  selectedMaterialId?: string,
  selectedColorId?: string,
  selectedSizeKey?: string,
): Promise<void> {
  await getItemEditableOwnedProject(ownerUserId, projectId);

  const editableFilter = buildItemEditableFilter(projectId, ownerUserId);
  const project = await Project.findOne(editableFilter);

  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const existingItem = project.items.find(
    (item) => item._id.toString() === itemId,
  );

  if (!existingItem) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const verified = await verifyProjectItemSelectionForEdit(
    existingItem.productId.toString(),
    selectedMaterialId,
    selectedColorId,
    selectedSizeKey,
  );

  const snapshot = buildProjectItemSnapshot(verified.productView, verified);

  const result = await Project.updateOne(editableFilter, {
    $set: {
      "items.$[item].selectedMaterialId": verified.selectedMaterialId,
      "items.$[item].selectedColorId": verified.selectedColorId,
      "items.$[item].selectedSizeKey": verified.selectedSizeKey,
      "items.$[item].quantity": quantity,
      "items.$[item].snapshot": snapshot,
    },
  }, {
    arrayFilters: [{ "item._id": new Types.ObjectId(itemId) }],
  });

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }
}

export async function removeProjectItem(
  ownerUserId: string,
  projectId: string,
  itemId: string,
): Promise<void> {
  await getItemEditableOwnedProject(ownerUserId, projectId);

  const result = await Project.updateOne(
    buildItemEditableFilter(projectId, ownerUserId),
    {
      $pull: { items: { _id: new Types.ObjectId(itemId) } },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }
}

export { isProjectOnboardingDeletable };
