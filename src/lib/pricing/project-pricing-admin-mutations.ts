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
import { applyAdminCommercialPricingUpdate } from "@/lib/pricing/pricing-item-helpers";
import { isAdminProjectPricingEditable } from "@/lib/pricing/pricing-gates";
import { validateAdminCommercialPricingInput } from "@/lib/pricing/pricing-commercial-model";
import { PRICING_ERRORS } from "@/lib/pricing/pricing-validation";
import {
  appendCommercialDirtyToSet,
  applyCommercialDirtyToDocument,
} from "@/lib/projects/project-commercial-dirty";
import { appendOpenAdminPricingRoundToUpdate } from "@/lib/pricing/admin-pricing-round";

type SetProjectItemAdminPricingInput = {
  projectId: string;
  itemId: string;
  internalCostAgorot: number;
  clientPriceAgorot: number;
  architectMarkupBp: number;
  expectedPriceVersion?: number;
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

async function assertItemExistsForVersionConflict(
  projectId: string,
  itemId: string,
): Promise<void> {
  const project = await Project.findById(projectId).select(
    "items._id items.pricing.priceVersion",
  );

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
  const validation = validateAdminCommercialPricingInput({
    internalCostAgorot: input.internalCostAgorot,
    clientPriceAgorot: input.clientPriceAgorot,
    architectMarkupBp: input.architectMarkupBp,
  });

  if (!validation.ok) {
    throw new ProjectMutationError(validation.message);
  }

  if (
    !Types.ObjectId.isValid(input.projectId) ||
    !Types.ObjectId.isValid(input.itemId)
  ) {
    throw new ProjectMutationError(PRICING_ERRORS.PROJECT_NOT_FOUND);
  }

  const project = await getPricingEditableProject(input.projectId);
  const item = project.items.find((entry) => entry._id.toString() === input.itemId);

  if (!item) {
    throw new ProjectMutationError(PRICING_ERRORS.ITEM_NOT_FOUND);
  }

  const existingPricing: IProjectItemPricing = item.pricing ?? {
    priceVersion: 0,
    clientPriceStale: false,
    pricingReviewStatus: "none",
  };

  const updatedPricing = applyAdminCommercialPricingUpdate({
    pricing: existingPricing,
    commercialPricing: {
      internalCostAgorot: input.internalCostAgorot,
      clientPriceAgorot: input.clientPriceAgorot,
      architectMarkupBp: input.architectMarkupBp,
    },
  });

  const now = new Date();
  const adminObjectId = new Types.ObjectId(adminUserId);
  const isFirstTimePricing = item.pricing == null;

  const pricingDocument: IProjectItemPricing = {
    ...updatedPricing,
    pricedAt: now,
    pricedByAdminUserId: adminObjectId,
  };

  let updateDoc: Record<string, unknown>;

  if (isFirstTimePricing) {
    updateDoc = {
      $set: {
        "items.$[item].pricing": pricingDocument,
      },
    };
  } else {
    updateDoc = {
      $set: {
        "items.$[item].pricing.internalCostAgorot": input.internalCostAgorot,
        "items.$[item].pricing.clientPriceAgorot": input.clientPriceAgorot,
        "items.$[item].pricing.architectMarkupBp": input.architectMarkupBp,
        "items.$[item].pricing.architectProfitAgorot":
          updatedPricing.architectProfitAgorot,
        "items.$[item].pricing.pricingReviewStatus": "none",
        "items.$[item].pricing.clientPriceStale": false,
        "items.$[item].pricing.priceVersion": updatedPricing.priceVersion,
        "items.$[item].pricing.pricedAt": now,
        "items.$[item].pricing.pricedByAdminUserId": adminObjectId,
      },
      $unset: {
        "items.$[item].pricing.architectPriceAgorot": "",
      },
    };
  }

  const dirtySet = (updateDoc.$set ?? {}) as Record<string, unknown>;
  appendCommercialDirtyToSet(project, dirtySet);
  appendOpenAdminPricingRoundToUpdate(project, updateDoc);
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

/** @deprecated Pricing V1 — bulk default markup repricing removed in V2 */
export async function setProjectDefaultAdminMarkup(
  _adminUserId: string,
  _input: { projectId: string; defaultAdminMarkupBp: number },
): Promise<void> {
  throw new ProjectMutationError(PRICING_ERRORS.NOT_EDITABLE);
}

export async function markProjectItemPricingNeedsReview(
  project: IProject,
  itemId: string,
): Promise<void> {
  applyCommercialDirtyToDocument(project);

  const item = project.items.find((entry) => entry._id.toString() === itemId) as
    | IProjectItem
    | undefined;

  if (!item?.pricing) {
    return;
  }

  item.pricing.pricingReviewStatus = "needs_review";
  await project.save();
}
