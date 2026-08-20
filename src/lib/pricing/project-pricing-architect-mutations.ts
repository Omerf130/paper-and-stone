import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project, {
  type IProject,
  type IProjectItem,
  type IProjectItemPricing,
} from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";
import {
  ARCHITECT_WORKSPACE_EDITABLE_STATUS_FILTER,
  usesLayeredPricing,
} from "@/lib/projects/project-workspace-gates";
import { isValidMarkupBasisPoints } from "@/lib/pricing/markup-basis-points";
import { applyArchitectPricingUpdate } from "@/lib/pricing/pricing-item-helpers";
import {
  getEffectiveArchitectMarkupBp,
  hasArchitectMarkupOverride,
} from "@/lib/pricing/pricing-inheritance";
import { isArchitectProjectPricingEditable } from "@/lib/pricing/pricing-gates";
import { PRICING_ERRORS } from "@/lib/pricing/pricing-validation";
import { appendCommercialDirtyToSet, applyCommercialDirtyToDocument } from "@/lib/projects/project-commercial-dirty";

type SetProjectItemArchitectPricingInput = {
  projectId: string;
  itemId: string;
  useProjectDefaultArchitectMarkup?: boolean;
  itemArchitectMarkupBp?: number;
  clearArchitectMarkupOverride?: boolean;
  expectedPriceVersion?: number;
};

type SetProjectDefaultArchitectMarkupInput = {
  projectId: string;
  defaultArchitectMarkupBp: number;
};

function buildOwnedPricingEditableProjectFilter(
  projectId: string,
  ownerUserId: string,
) {
  return {
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
    onboardingStatus: "active" as const,
    status: ARCHITECT_WORKSPACE_EDITABLE_STATUS_FILTER,
  };
}

async function getOwnedPricingEditableProject(
  ownerUserId: string,
  projectId: string,
): Promise<IProject> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const project = await Project.findOne(
    buildOwnedPricingEditableProjectFilter(projectId, ownerUserId),
  );

  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (!usesLayeredPricing(project)) {
    throw new ProjectMutationError(PRICING_ERRORS.NOT_EDITABLE);
  }

  if (!isArchitectProjectPricingEditable(project)) {
    throw new ProjectMutationError(PRICING_ERRORS.NOT_EDITABLE);
  }

  return project;
}

function assertValidMarkupBp(markupBp: number): void {
  if (!isValidMarkupBasisPoints(markupBp)) {
    throw new ProjectMutationError(PRICING_ERRORS.INVALID_MARKUP);
  }
}

function resolveArchitectMarkupUpdate(input: {
  useProjectDefaultArchitectMarkup?: boolean;
  itemArchitectMarkupBp?: number;
  clearArchitectMarkupOverride?: boolean;
  item: IProjectItem;
  project: IProject;
}): {
  architectMarkupBp: number;
  overrideUpdate: "set" | "unset" | "keep";
  overrideValue?: number;
} {
  if (input.clearArchitectMarkupOverride || input.useProjectDefaultArchitectMarkup) {
    const architectMarkupBp = input.project.defaultArchitectMarkupBp;

    if (architectMarkupBp == null) {
      throw new ProjectMutationError(PRICING_ERRORS.MARKUP_REQUIRED);
    }

    return {
      architectMarkupBp,
      overrideUpdate: "unset",
    };
  }

  if (input.itemArchitectMarkupBp != null) {
    assertValidMarkupBp(input.itemArchitectMarkupBp);

    return {
      architectMarkupBp: input.itemArchitectMarkupBp,
      overrideUpdate: "set",
      overrideValue: input.itemArchitectMarkupBp,
    };
  }

  const architectMarkupBp = getEffectiveArchitectMarkupBp(input.item, input.project);

  if (architectMarkupBp == null) {
    throw new ProjectMutationError(PRICING_ERRORS.MARKUP_REQUIRED);
  }

  return {
    architectMarkupBp,
    overrideUpdate: "keep",
  };
}

function buildPriceVersionArrayFilter(
  expectedPriceVersion: number | undefined,
): Record<string, unknown> {
  const arrayFilter: Record<string, unknown> = {};

  if (expectedPriceVersion == null) {
    return arrayFilter;
  }

  if (expectedPriceVersion === 0) {
    arrayFilter.$or = [
      { "item.pricing.priceVersion": 0 },
      { "item.pricing.priceVersion": { $exists: false } },
      { "item.pricing": { $exists: false } },
    ];
  } else {
    arrayFilter["item.pricing.priceVersion"] = expectedPriceVersion;
  }

  return arrayFilter;
}

function buildPriceVersionElemMatch(
  itemId: string,
  expectedPriceVersion: number | undefined,
): Record<string, unknown> {
  const elemMatch: Record<string, unknown> = {
    _id: new Types.ObjectId(itemId),
  };

  if (expectedPriceVersion == null) {
    return elemMatch;
  }

  if (expectedPriceVersion === 0) {
    elemMatch.$or = [
      { "pricing.priceVersion": 0 },
      { "pricing.priceVersion": { $exists: false } },
      { "pricing": { $exists: false } },
    ];
  } else {
    elemMatch["pricing.priceVersion"] = expectedPriceVersion;
  }

  return elemMatch;
}

async function assertItemExistsForVersionConflict(
  projectId: string,
  ownerUserId: string,
  itemId: string,
): Promise<void> {
  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
  }).select("items._id");

  const item = project?.items.find((entry) => entry._id.toString() === itemId);

  if (!item) {
    throw new ProjectMutationError(PRICING_ERRORS.ITEM_NOT_FOUND);
  }

  throw new ProjectMutationError(PRICING_ERRORS.VERSION_CONFLICT);
}

function assertArchitectPriceExists(pricing: IProjectItemPricing | undefined): number {
  if (pricing?.architectPriceAgorot == null) {
    throw new ProjectMutationError(PRICING_ERRORS.ARCHITECT_PRICE_REQUIRED);
  }

  return pricing.architectPriceAgorot;
}

export async function setProjectItemArchitectPricing(
  ownerUserId: string,
  input: SetProjectItemArchitectPricingInput,
): Promise<void> {
  if (!Types.ObjectId.isValid(input.projectId) || !Types.ObjectId.isValid(input.itemId)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const project = await getOwnedPricingEditableProject(ownerUserId, input.projectId);
  const item = project.items.find((entry) => entry._id.toString() === input.itemId);

  if (!item) {
    throw new ProjectMutationError(PRICING_ERRORS.ITEM_NOT_FOUND);
  }

  const existingPricing: IProjectItemPricing = item.pricing ?? {
    priceVersion: 0,
    clientPriceStale: false,
  };
  const architectPriceAgorot = assertArchitectPriceExists(existingPricing);

  const markupUpdate = resolveArchitectMarkupUpdate({
    useProjectDefaultArchitectMarkup: input.useProjectDefaultArchitectMarkup,
    itemArchitectMarkupBp: input.itemArchitectMarkupBp,
    clearArchitectMarkupOverride: input.clearArchitectMarkupOverride,
    item,
    project,
  });

  const updatedPricing = applyArchitectPricingUpdate({
    pricing: existingPricing,
    architectPriceAgorot,
    architectMarkupBp: markupUpdate.architectMarkupBp,
  });

  const now = new Date();
  const architectObjectId = new Types.ObjectId(ownerUserId);
  const $set: Record<string, unknown> = {
    "items.$[item].pricing.clientPriceAgorot": updatedPricing.clientPriceAgorot,
    "items.$[item].pricing.clientPriceStale": updatedPricing.clientPriceStale,
    "items.$[item].pricing.priceVersion": updatedPricing.priceVersion,
    "items.$[item].pricing.clientPricedAt": now,
    "items.$[item].pricing.clientPricedByArchitectUserId": architectObjectId,
  };

  const updateDoc: Record<string, unknown> = { $set };
  const $unset: Record<string, string> = {};

  if (markupUpdate.overrideUpdate === "unset") {
    $unset["items.$[item].pricing.architectMarkupBp"] = "";
  } else if (markupUpdate.overrideUpdate === "set") {
    $set["items.$[item].pricing.architectMarkupBp"] = markupUpdate.overrideValue;
  }

  if (Object.keys($unset).length > 0) {
    updateDoc.$unset = $unset;
  }

  appendCommercialDirtyToSet(project, $set);

  const arrayFilter: Record<string, unknown> = {
    "item._id": new Types.ObjectId(input.itemId),
    ...buildPriceVersionArrayFilter(input.expectedPriceVersion),
  };

  const result = await Project.updateOne(
    {
      ...buildOwnedPricingEditableProjectFilter(input.projectId, ownerUserId),
      items: {
        $elemMatch: buildPriceVersionElemMatch(
          input.itemId,
          input.expectedPriceVersion,
        ),
      },
    },
    updateDoc,
    {
      arrayFilters: [arrayFilter],
    },
  );

  if (result.matchedCount === 0) {
    await assertItemExistsForVersionConflict(
      input.projectId,
      ownerUserId,
      input.itemId,
    );
  }
}

export async function setProjectDefaultArchitectMarkup(
  ownerUserId: string,
  input: SetProjectDefaultArchitectMarkupInput,
): Promise<void> {
  assertValidMarkupBp(input.defaultArchitectMarkupBp);

  const project = await getOwnedPricingEditableProject(ownerUserId, input.projectId);
  const now = new Date();
  const architectObjectId = new Types.ObjectId(ownerUserId);

  for (const item of project.items) {
    if (hasArchitectMarkupOverride(item.pricing)) {
      continue;
    }

    const architectPriceAgorot = item.pricing?.architectPriceAgorot;
    if (architectPriceAgorot == null) {
      continue;
    }

    const existingPricing: IProjectItemPricing = item.pricing!;
    const updatedPricing = applyArchitectPricingUpdate({
      pricing: existingPricing,
      architectPriceAgorot,
      architectMarkupBp: input.defaultArchitectMarkupBp,
    });

    item.pricing = {
      ...existingPricing,
      ...updatedPricing,
      clientPricedAt: now,
      clientPricedByArchitectUserId: architectObjectId,
    };
  }

  project.defaultArchitectMarkupBp = input.defaultArchitectMarkupBp;
  applyCommercialDirtyToDocument(project);
  await project.save();
}
