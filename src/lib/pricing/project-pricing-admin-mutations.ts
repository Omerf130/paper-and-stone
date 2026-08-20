import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project, {
  type IProject,
  type IProjectItem,
  type IProjectItemPricing,
} from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  ADMIN_PRICING_STATUS_FILTER,
  usesLayeredPricing,
} from "@/lib/projects/project-workspace-gates";
import { isValidMarkupBasisPoints } from "@/lib/pricing/markup-basis-points";
import {
  applyAdminPricingUpdate,
} from "@/lib/pricing/pricing-item-helpers";
import {
  getEffectiveAdminMarkupBp,
  hasAdminMarkupOverride,
} from "@/lib/pricing/pricing-inheritance";
import {
  isAdminProjectPricingEditable,
} from "@/lib/pricing/pricing-gates";
import { PRICING_ERRORS } from "@/lib/pricing/pricing-validation";
import { appendCommercialDirtyToSet, applyCommercialDirtyToDocument } from "@/lib/projects/project-commercial-dirty";

type SetProjectItemAdminPricingInput = {
  projectId: string;
  itemId: string;
  internalCostAgorot: number;
  useProjectDefaultAdminMarkup?: boolean;
  itemAdminMarkupBp?: number;
  clearAdminMarkupOverride?: boolean;
  expectedPriceVersion?: number;
};

type SetProjectDefaultAdminMarkupInput = {
  projectId: string;
  defaultAdminMarkupBp: number;
};

function buildPricingEditableProjectFilter(projectId: string) {
  return {
    _id: new Types.ObjectId(projectId),
    onboardingStatus: "active" as const,
    status: ADMIN_PRICING_STATUS_FILTER,
  };
}

async function getPricingEditableProject(projectId: string): Promise<IProject> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PRICING_ERRORS.PROJECT_NOT_FOUND);
  }

  const project = await Project.findOne(buildPricingEditableProjectFilter(projectId));

  if (!project) {
    throw new ProjectMutationError(PRICING_ERRORS.PROJECT_NOT_FOUND);
  }

  if (!usesLayeredPricing(project)) {
    throw new ProjectMutationError(PRICING_ERRORS.NOT_EDITABLE);
  }

  if (!isAdminProjectPricingEditable(project)) {
    throw new ProjectMutationError(PRICING_ERRORS.NOT_EDITABLE);
  }

  return project;
}

function assertValidInternalCost(internalCostAgorot: number): void {
  if (
    !Number.isInteger(internalCostAgorot) ||
    internalCostAgorot < 0
  ) {
    throw new ProjectMutationError(PRICING_ERRORS.INVALID_COST);
  }
}

function assertValidMarkupBp(markupBp: number): void {
  if (!isValidMarkupBasisPoints(markupBp)) {
    throw new ProjectMutationError(PRICING_ERRORS.INVALID_MARKUP);
  }
}

function resolveAdminMarkupUpdate(input: {
  useProjectDefaultAdminMarkup?: boolean;
  itemAdminMarkupBp?: number;
  clearAdminMarkupOverride?: boolean;
  item: IProjectItem;
  project: IProject;
}): {
  adminMarkupBp: number;
  overrideUpdate: "set" | "unset" | "keep";
  overrideValue?: number;
} {
  if (input.clearAdminMarkupOverride || input.useProjectDefaultAdminMarkup) {
    const adminMarkupBp = input.project.defaultAdminMarkupBp;

    if (adminMarkupBp == null) {
      throw new ProjectMutationError(PRICING_ERRORS.MARKUP_REQUIRED);
    }

    return {
      adminMarkupBp,
      overrideUpdate: "unset",
    };
  }

  if (input.itemAdminMarkupBp != null) {
    assertValidMarkupBp(input.itemAdminMarkupBp);

    return {
      adminMarkupBp: input.itemAdminMarkupBp,
      overrideUpdate: "set",
      overrideValue: input.itemAdminMarkupBp,
    };
  }

  const adminMarkupBp = getEffectiveAdminMarkupBp(input.item, input.project);

  if (adminMarkupBp == null) {
    throw new ProjectMutationError(PRICING_ERRORS.MARKUP_REQUIRED);
  }

  return {
    adminMarkupBp,
    overrideUpdate: "keep",
  };
}

async function assertItemExistsForVersionConflict(
  projectId: string,
  itemId: string,
): Promise<void> {
  const project = await Project.findById(projectId).select("items._id items.pricing.priceVersion");

  const item = project?.items.find((entry) => entry._id.toString() === itemId);

  if (!item) {
    throw new ProjectMutationError(PRICING_ERRORS.ITEM_NOT_FOUND);
  }

  throw new ProjectMutationError(PRICING_ERRORS.VERSION_CONFLICT);
}

export async function setProjectItemAdminPricing(
  adminUserId: string,
  input: SetProjectItemAdminPricingInput,
): Promise<void> {
  assertValidInternalCost(input.internalCostAgorot);

  if (!Types.ObjectId.isValid(input.projectId) || !Types.ObjectId.isValid(input.itemId)) {
    throw new ProjectMutationError(PRICING_ERRORS.PROJECT_NOT_FOUND);
  }

  const project = await getPricingEditableProject(input.projectId);
  const item = project.items.find((entry) => entry._id.toString() === input.itemId);

  if (!item) {
    throw new ProjectMutationError(PRICING_ERRORS.ITEM_NOT_FOUND);
  }

  const markupUpdate = resolveAdminMarkupUpdate({
    useProjectDefaultAdminMarkup: input.useProjectDefaultAdminMarkup,
    itemAdminMarkupBp: input.itemAdminMarkupBp,
    clearAdminMarkupOverride: input.clearAdminMarkupOverride,
    item,
    project,
  });

  const existingPricing: IProjectItemPricing = item.pricing ?? {
    priceVersion: 0,
    clientPriceStale: false,
  };
  const hadClientPrice = existingPricing.clientPriceAgorot != null;

  const updatedPricing = applyAdminPricingUpdate({
    pricing: existingPricing,
    internalCostAgorot: input.internalCostAgorot,
    adminMarkupBp: markupUpdate.adminMarkupBp,
    hadClientPrice,
  });

  const now = new Date();
  const adminObjectId = new Types.ObjectId(adminUserId);
  const isFirstTimePricing = item.pricing == null;

  const pricingDocument: IProjectItemPricing = {
    ...updatedPricing,
    pricedAt: now,
    pricedByAdminUserId: adminObjectId,
  };

  if (markupUpdate.overrideUpdate === "set") {
    pricingDocument.adminMarkupBp = markupUpdate.overrideValue;
  } else if (markupUpdate.overrideUpdate === "unset") {
    delete pricingDocument.adminMarkupBp;
  }

  let updateDoc: Record<string, unknown>;

  if (isFirstTimePricing) {
    updateDoc = {
      $set: {
        "items.$[item].pricing": pricingDocument,
      },
    };
  } else {
    const $set: Record<string, unknown> = {
      "items.$[item].pricing.internalCostAgorot": input.internalCostAgorot,
      "items.$[item].pricing.architectPriceAgorot": updatedPricing.architectPriceAgorot,
      "items.$[item].pricing.priceVersion": updatedPricing.priceVersion,
      "items.$[item].pricing.clientPriceStale": updatedPricing.clientPriceStale,
      "items.$[item].pricing.pricedAt": now,
      "items.$[item].pricing.pricedByAdminUserId": adminObjectId,
    };

    updateDoc = { $set };
    const $unset: Record<string, string> = {};

    if (markupUpdate.overrideUpdate === "unset") {
      $unset["items.$[item].pricing.adminMarkupBp"] = "";
    } else if (markupUpdate.overrideUpdate === "set") {
      $set["items.$[item].pricing.adminMarkupBp"] = markupUpdate.overrideValue;
    }

    if (Object.keys($unset).length > 0) {
      updateDoc.$unset = $unset;
    }
  }

  const dirtySet = (updateDoc.$set ?? {}) as Record<string, unknown>;
  appendCommercialDirtyToSet(project, dirtySet);
  updateDoc.$set = dirtySet;

  const arrayFilter: Record<string, unknown> = {
    "item._id": new Types.ObjectId(input.itemId),
  };

  if (
    !isFirstTimePricing &&
    input.expectedPriceVersion != null &&
    input.expectedPriceVersion > 0
  ) {
    arrayFilter["item.pricing.priceVersion"] = input.expectedPriceVersion;
  }

  const elemMatch: Record<string, unknown> = {
    _id: new Types.ObjectId(input.itemId),
  };

  if (isFirstTimePricing) {
    elemMatch.pricing = { $exists: false };
  } else if (input.expectedPriceVersion != null && input.expectedPriceVersion > 0) {
    elemMatch["pricing.priceVersion"] = input.expectedPriceVersion;
  } else if (input.expectedPriceVersion === 0) {
    elemMatch.$or = [
      { "pricing.priceVersion": 0 },
      { "pricing.priceVersion": { $exists: false } },
    ];
  }

  const result = await Project.updateOne(
    {
      ...buildPricingEditableProjectFilter(input.projectId),
      items: { $elemMatch: elemMatch },
    },
    updateDoc,
    {
      arrayFilters: [arrayFilter],
    },
  );

  if (result.matchedCount === 0 || result.modifiedCount === 0) {
    await assertItemExistsForVersionConflict(input.projectId, input.itemId);
  }
}

export async function setProjectDefaultAdminMarkup(
  adminUserId: string,
  input: SetProjectDefaultAdminMarkupInput,
): Promise<void> {
  assertValidMarkupBp(input.defaultAdminMarkupBp);

  const project = await getPricingEditableProject(input.projectId);
  const now = new Date();
  const adminObjectId = new Types.ObjectId(adminUserId);

  for (const item of project.items) {
    if (hasAdminMarkupOverride(item.pricing)) {
      continue;
    }

    const internalCostAgorot = item.pricing?.internalCostAgorot;
    if (internalCostAgorot == null) {
      continue;
    }

    const existingPricing: IProjectItemPricing = item.pricing!;
    const hadClientPrice = existingPricing.clientPriceAgorot != null;
    const updatedPricing = applyAdminPricingUpdate({
      pricing: existingPricing,
      internalCostAgorot,
      adminMarkupBp: input.defaultAdminMarkupBp,
      hadClientPrice,
    });

    item.pricing = {
      ...existingPricing,
      ...updatedPricing,
      pricedAt: now,
      pricedByAdminUserId: adminObjectId,
    };
  }

  project.defaultAdminMarkupBp = input.defaultAdminMarkupBp;
  applyCommercialDirtyToDocument(project);
  await project.save();
}
