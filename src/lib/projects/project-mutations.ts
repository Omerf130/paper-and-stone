import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project, { type IProjectItem } from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  MAX_PROJECT_ITEM_QUANTITY,
  PROJECT_ERRORS,
  type ProjectWriteFields,
} from "@/lib/projects/project-validation";
import { assertProjectEditable } from "@/lib/projects/assertProjectEditable";
import { buildProjectItemSnapshot } from "@/lib/projects/buildProjectItemSnapshot";
import {
  buildElemMatchCriteria,
  buildProjectItemSelectionKey,
  projectItemsMatchSelection,
} from "@/lib/projects/project-item-matching";
import { verifyProjectItemSelectionForAdd, verifyProjectItemSelectionForEdit } from "@/lib/projects/verifyProjectItemSelection";
import { getMyProfessionalProfileView } from "@/lib/professionals/ensureProfessionalProfile";
import { isProfileReadyForProjects } from "@/lib/professionals/profile-readiness";

async function assertProfileReadyForProjects(userId: string): Promise<void> {
  const profile = await getMyProfessionalProfileView(userId);

  if (!isProfileReadyForProjects(profile)) {
    throw new ProjectMutationError(PROJECT_ERRORS.PROFILE_NOT_READY);
  }
}

async function getEditableOwnedProject(
  ownerUserId: string,
  projectId: string,
) {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
  });

  return assertProjectEditable(project);
}

export async function createProject(
  ownerUserId: string,
  fields: ProjectWriteFields,
): Promise<string> {
  await assertProfileReadyForProjects(ownerUserId);
  await connectDB();

  const project = await Project.create({
    ownerUserId: new Types.ObjectId(ownerUserId),
    name: fields.name,
    clientName: fields.clientName,
    location: fields.location,
    description: fields.description,
    status: "draft",
    items: [],
  });

  return project._id.toString();
}

export async function updateProject(
  ownerUserId: string,
  projectId: string,
  fields: ProjectWriteFields,
): Promise<void> {
  await getEditableOwnedProject(ownerUserId, projectId);

  const result = await Project.updateOne(
    {
      _id: new Types.ObjectId(projectId),
      ownerUserId: new Types.ObjectId(ownerUserId),
      status: "draft",
    },
    {
      $set: {
        name: fields.name,
        clientName: fields.clientName ?? null,
        location: fields.location ?? null,
        description: fields.description ?? null,
      },
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
  await getEditableOwnedProject(ownerUserId, projectId);

  const result = await Project.deleteOne({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
    status: "draft",
  });

  if (result.deletedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }
}

function buildNewProjectItem(
  verified: Awaited<ReturnType<typeof verifyProjectItemSelectionForAdd>>,
  quantity: number,
): IProjectItem {
  const snapshot = buildProjectItemSnapshot(verified.productView, verified);

  return {
    _id: new Types.ObjectId(),
    productId: new Types.ObjectId(verified.productId),
    selectedMaterialId: verified.selectedMaterialId,
    selectedColorId: verified.selectedColorId,
    selectedSizeKey: verified.selectedSizeKey,
    quantity,
    snapshot,
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
): Promise<void> {
  await assertProfileReadyForProjects(ownerUserId);
  await getEditableOwnedProject(ownerUserId, projectId);

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
  );

  const incrementResult = await Project.updateOne(
    {
      _id: new Types.ObjectId(projectId),
      ownerUserId: new Types.ObjectId(ownerUserId),
      status: "draft",
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

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
    status: "draft",
  });

  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const existingItem = project.items.find((item) =>
    projectItemsMatchSelection(item, selectionKey),
  );

  if (existingItem) {
    if (existingItem.quantity + quantity > MAX_PROJECT_ITEM_QUANTITY) {
      throw new ProjectMutationError(PROJECT_ERRORS.QUANTITY_EXCEEDS_MAX);
    }

    const retryResult = await Project.updateOne(
      {
        _id: new Types.ObjectId(projectId),
        ownerUserId: new Types.ObjectId(ownerUserId),
        status: "draft",
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

  const newItem = buildNewProjectItem(verified, quantity);

  const pushResult = await Project.updateOne(
    {
      _id: new Types.ObjectId(projectId),
      ownerUserId: new Types.ObjectId(ownerUserId),
      status: "draft",
    },
    {
      $push: { items: newItem },
    },
  );

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
  await getEditableOwnedProject(ownerUserId, projectId);

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
    status: "draft",
  });

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

  const result = await Project.updateOne(
    {
      _id: new Types.ObjectId(projectId),
      ownerUserId: new Types.ObjectId(ownerUserId),
      status: "draft",
    },
    {
      $set: {
        "items.$[item].selectedMaterialId": verified.selectedMaterialId,
        "items.$[item].selectedColorId": verified.selectedColorId,
        "items.$[item].selectedSizeKey": verified.selectedSizeKey,
        "items.$[item].quantity": quantity,
        "items.$[item].snapshot": snapshot,
      },
    },
    {
      arrayFilters: [{ "item._id": new Types.ObjectId(itemId) }],
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }
}

export async function removeProjectItem(
  ownerUserId: string,
  projectId: string,
  itemId: string,
): Promise<void> {
  await getEditableOwnedProject(ownerUserId, projectId);

  const result = await Project.updateOne(
    {
      _id: new Types.ObjectId(projectId),
      ownerUserId: new Types.ObjectId(ownerUserId),
      status: "draft",
    },
    {
      $pull: { items: { _id: new Types.ObjectId(itemId) } },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }
}
