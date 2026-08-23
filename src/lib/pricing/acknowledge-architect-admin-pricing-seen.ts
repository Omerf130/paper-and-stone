import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";
import { getAdminPricingDeliveredRevision } from "@/lib/pricing/admin-pricing-round";
import { usesLayeredPricing } from "@/lib/projects/project-workspace-gates";

export async function acknowledgeArchitectAdminPricingSeen(
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
  }).select(
    "onboardingStatus adminPricingDeliveredRevision architectAdminPricingSeenRevision",
  );

  if (!project || !usesLayeredPricing(project)) {
    return;
  }

  const deliveredRevision = getAdminPricingDeliveredRevision(project);
  const seenRevision = project.architectAdminPricingSeenRevision ?? 0;

  if (deliveredRevision <= seenRevision) {
    return;
  }

  await Project.updateOne(
    { _id: project._id },
    { $set: { architectAdminPricingSeenRevision: deliveredRevision } },
  );
}
