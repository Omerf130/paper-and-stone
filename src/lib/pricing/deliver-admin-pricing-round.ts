import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project, { type IProject } from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { usesLayeredPricing } from "@/lib/projects/project-workspace-gates";
import { isAdminProjectPricingEditable } from "@/lib/pricing/pricing-gates";
import {
  getAdminPricingRevision,
  isAdminPricingReadyToDeliver,
} from "@/lib/pricing/admin-pricing-round";
import { PRICING_ERRORS } from "@/lib/pricing/pricing-validation";
import { buildReviewHistoryEntry } from "@/lib/projects/project-review-history";

type DeliverAdminPricingRoundInput = {
  projectId: string;
  expectedAdminPricingRevision: number;
};

async function getDeliverableProject(projectId: string): Promise<IProject> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PRICING_ERRORS.PROJECT_NOT_FOUND);
  }

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    onboardingStatus: "active",
    status: { $ne: "rejected" },
  });

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

export function getAdminPricingDeliveryBlockedReason(
  project: Pick<
    IProject,
    | "onboardingStatus"
    | "adminPricingRevision"
    | "adminPricingDeliveredRevision"
    | "items"
  >,
): string | null {
  if (!usesLayeredPricing(project)) {
    return null;
  }

  if (!isAdminPricingReadyToDeliver(project)) {
    if (
      getAdminPricingRevision(project) >
      (project.adminPricingDeliveredRevision ?? 0)
    ) {
      return PRICING_ERRORS.ADMIN_PRICING_INCOMPLETE;
    }

    return null;
  }

  return null;
}

export async function deliverAdminPricingRound(
  adminUserId: string,
  input: DeliverAdminPricingRoundInput,
): Promise<void> {
  const project = await getDeliverableProject(input.projectId);
  const currentRevision = getAdminPricingRevision(project);

  if (currentRevision !== input.expectedAdminPricingRevision) {
    throw new ProjectMutationError(PRICING_ERRORS.ADMIN_PRICING_DELIVERY_CONFLICT);
  }

  if (!isAdminPricingReadyToDeliver(project)) {
    throw new ProjectMutationError(PRICING_ERRORS.ADMIN_PRICING_INCOMPLETE);
  }

  const historyEntry = buildReviewHistoryEntry({
    action: "admin_pricing_delivered",
    fromStatus: project.status,
    toStatus: project.status,
    actorUserId: adminUserId,
    actorRole: "admin",
    message: `revision ${currentRevision}`,
  });

  const result = await Project.updateOne(
    {
      _id: project._id,
      adminPricingRevision: currentRevision,
    },
    {
      $set: {
        adminPricingDeliveredRevision: currentRevision,
      },
      $push: {
        reviewHistory: historyEntry,
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PRICING_ERRORS.ADMIN_PRICING_DELIVERY_CONFLICT);
  }
}
