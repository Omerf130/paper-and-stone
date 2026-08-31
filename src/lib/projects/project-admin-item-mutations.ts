import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project, { type IProject, type IProjectItem } from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  MAX_PROJECT_ITEM_QUANTITY,
  PROJECT_ERRORS,
} from "@/lib/projects/project-validation";
import { buildProjectItemSnapshot } from "@/lib/projects/buildProjectItemSnapshot";
import { createInitialItemPricing } from "@/lib/pricing/pricing-item-helpers";
import { shouldMarkItemPricingNeedsReview } from "@/lib/pricing/pricing-review-detection";
import {
  buildElemMatchCriteria,
  buildProjectItemSelectionKey,
  projectItemsMatchSelection,
} from "@/lib/projects/project-item-matching";
import {
  verifyProjectItemSelectionForAdd,
  verifyProjectItemSelectionForEdit,
} from "@/lib/projects/verifyProjectItemSelection";
import {
  isAdminProjectWorkspaceEditable,
  usesLayeredPricing,
  usesRoomBasedWorkspace,
} from "@/lib/projects/project-workspace-gates";
import { verifyRoomBelongsToProject } from "@/lib/projects/project-room-mutations";
import { appendCommercialDirtyToSet } from "@/lib/projects/project-commercial-dirty";
import { appendOpenAdminPricingRoundToUpdate } from "@/lib/pricing/admin-pricing-round";

function buildAdminEditableProjectFilter(projectId: string) {
  return {
    _id: new Types.ObjectId(projectId),
    onboardingStatus: "active" as const,
    status: { $nin: ["rejected"] as const },
  };
}

async function getAdminEditableProject(projectId: string): Promise<IProject> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const project = await Project.findOne(buildAdminEditableProjectFilter(projectId));

  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (!isAdminProjectWorkspaceEditable(project)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_EDITABLE);
  }

  return project;
}

function withCommercialDirtySet(
  project: Pick<IProject, "onboardingStatus" | "status" | "commercialDirty">,
  update: Record<string, unknown>,
): Record<string, unknown> {
  const $set: Record<string, unknown> = {
    ...(typeof update.$set === "object" && update.$set != null
      ? (update.$set as Record<string, unknown>)
      : {}),
  };
  appendCommercialDirtyToSet(project, $set);

  if (Object.keys($set).length === 0) {
    return update;
  }

  return {
    ...update,
    $set,
  };
}

function withAdminPricingRoundUpdate(
  project: Pick<
    IProject,
    "onboardingStatus" | "adminPricingRevision" | "adminPricingDeliveredRevision"
  >,
  update: Record<string, unknown>,
): Record<string, unknown> {
  const nextUpdate = { ...update };
  appendOpenAdminPricingRoundToUpdate(project, nextUpdate);
  return nextUpdate;
}

function withLayeredProjectItemUpdate(
  project: Pick<
    IProject,
    | "onboardingStatus"
    | "status"
    | "commercialDirty"
    | "adminPricingRevision"
    | "adminPricingDeliveredRevision"
  >,
  update: Record<string, unknown>,
): Record<string, unknown> {
  return withCommercialDirtySet(
    project,
    withAdminPricingRoundUpdate(project, update),
  );
}

function buildNewProjectItem(
  verified: Awaited<ReturnType<typeof verifyProjectItemSelectionForAdd>>,
  quantity: number,
  roomId?: Types.ObjectId | null,
  project?: Pick<IProject, "onboardingStatus">,
): IProjectItem {
  const snapshot = buildProjectItemSnapshot(verified.productView, verified);
  const pricing =
    project && usesLayeredPricing(project) ? createInitialItemPricing() : undefined;

  return {
    _id: new Types.ObjectId(),
    productId: new Types.ObjectId(verified.productId),
    roomId: roomId ?? null,
    selectedMaterialId: verified.selectedMaterialId,
    selectedColorId: verified.selectedColorId,
    selectedSizeKey: verified.selectedSizeKey,
    quantity,
    snapshot,
    ...(project && usesLayeredPricing(project) ? { status: "draft" as const } : {}),
    ...(pricing ? { pricing } : {}),
  };
}

export async function addProductToProjectAsAdmin(
  projectId: string,
  productSlug: string,
  quantity: number,
  selectedMaterialId?: string,
  selectedColorId?: string,
  selectedSizeKey?: string,
  roomId?: string,
): Promise<void> {
  const project = await getAdminEditableProject(projectId);

  let roomObjectId: Types.ObjectId | null = null;

  if (roomId?.trim()) {
    if (!usesRoomBasedWorkspace(project)) {
      throw new ProjectMutationError(PROJECT_ERRORS.NOT_EDITABLE);
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

  const editableFilter = buildAdminEditableProjectFilter(projectId);

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
    withLayeredProjectItemUpdate(project, {
      $inc: { "items.$.quantity": quantity },
    }),
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
      withLayeredProjectItemUpdate(project, {
        $inc: { "items.$.quantity": quantity },
      }),
    );

    if (retryResult.modifiedCount > 0) {
      return;
    }

    throw new ProjectMutationError(PROJECT_ERRORS.QUANTITY_EXCEEDS_MAX);
  }

  const newItem = buildNewProjectItem(verified, quantity, roomObjectId, project);

  const pushResult = await Project.updateOne(
    editableFilter,
    withLayeredProjectItemUpdate(project, {
      $push: { items: newItem },
    }),
  );

  if (pushResult.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }
}

export async function updateProjectItemAsAdmin(
  projectId: string,
  itemId: string,
  quantity: number,
  selectedMaterialId?: string,
  selectedColorId?: string,
  selectedSizeKey?: string,
): Promise<void> {
  await getAdminEditableProject(projectId);

  const editableFilter = buildAdminEditableProjectFilter(projectId);
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

  const configurationChanged =
    existingItem.selectedMaterialId !== verified.selectedMaterialId ||
    existingItem.selectedColorId !== verified.selectedColorId ||
    existingItem.selectedSizeKey !== verified.selectedSizeKey;
  const quantityChanged = existingItem.quantity !== quantity;

  const nextConfiguration = {
    selectedMaterialId: verified.selectedMaterialId,
    selectedColorId: verified.selectedColorId,
    selectedSizeKey: verified.selectedSizeKey,
  };

  const markNeedsReview = shouldMarkItemPricingNeedsReview({
    existingItem,
    nextConfiguration,
  });

  const $set: Record<string, unknown> = {
    "items.$[item].selectedMaterialId": verified.selectedMaterialId,
    "items.$[item].selectedColorId": verified.selectedColorId,
    "items.$[item].selectedSizeKey": verified.selectedSizeKey,
    "items.$[item].quantity": quantity,
    "items.$[item].snapshot": snapshot,
  };

  if (markNeedsReview) {
    $set["items.$[item].pricing.pricingReviewStatus"] = "needs_review";
  }

  const itemUpdate =
    configurationChanged || quantityChanged
      ? withLayeredProjectItemUpdate(project, { $set })
      : withCommercialDirtySet(project, { $set });

  const result = await Project.updateOne(editableFilter, itemUpdate, {
    arrayFilters: [{ "item._id": new Types.ObjectId(itemId) }],
  });

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }
}

export async function removeProjectItemAsAdmin(
  projectId: string,
  itemId: string,
): Promise<void> {
  const project = await getAdminEditableProject(projectId);

  const result = await Project.updateOne(
    buildAdminEditableProjectFilter(projectId),
    withCommercialDirtySet(project, {
      $pull: { items: { _id: new Types.ObjectId(itemId) } },
    }),
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }
}
