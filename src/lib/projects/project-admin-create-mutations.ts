import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { verifyClientEligibleForAssignment } from "@/lib/admin/clients/verifyClientEligibleForAssignment";
import { verifyArchitectEligibleForProjectOwnership } from "@/lib/admin/architects/architect-lookup-queries";
import { createWorkflowNotification } from "@/lib/notifications/createWorkflowNotification";
import {
  buildReviewHistoryEntry,
  createReviewEventId,
} from "@/lib/projects/project-review-history";
import { projectCreateInputSchema } from "@/lib/projects/project-validation";
import { z } from "zod";

const objectIdString = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "מזהה לא תקין");

export const adminCreateProjectInputSchema = projectCreateInputSchema.extend({
  ownerUserId: objectIdString,
  clientUserId: objectIdString,
});

export type AdminCreateProjectInput = z.infer<typeof adminCreateProjectInputSchema>;

export function parseAdminCreateProjectInput(input: unknown):
  | { success: true; data: AdminCreateProjectInput }
  | { success: false; fieldErrors: Record<string, string> } {
  const parsed = adminCreateProjectInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, fieldErrors };
  }
  return { success: true, data: parsed.data };
}

export async function createProjectAsAdmin(
  adminUserId: string,
  input: AdminCreateProjectInput,
): Promise<string> {
  await verifyArchitectEligibleForProjectOwnership(input.ownerUserId);
  await verifyClientEligibleForAssignment(input.clientUserId);

  await connectDB();

  const now = new Date();
  const reviewEventId = createReviewEventId();

  const createdEntry = buildReviewHistoryEntry({
    action: "onboarding_created",
    fromStatus: "draft",
    toStatus: "draft",
    actorUserId: adminUserId,
    actorRole: "admin",
  });

  const approvedEntry = buildReviewHistoryEntry({
    reviewEventId,
    action: "onboarding_approved",
    fromStatus: "draft",
    toStatus: "draft",
    actorUserId: adminUserId,
    actorRole: "admin",
  });

  const project = await Project.create({
    ownerUserId: new Types.ObjectId(input.ownerUserId),
    name: input.name,
    location: input.location,
    description: input.description,
    status: "draft",
    onboardingStatus: "active",
    clientUserId: new Types.ObjectId(input.clientUserId),
    clientAssignedAt: now,
    clientAssignedByUserId: new Types.ObjectId(adminUserId),
    onboardingApprovedAt: now,
    onboardingApprovedByUserId: new Types.ObjectId(adminUserId),
    items: [],
    reviewHistory: [createdEntry, approvedEntry],
  });

  await createWorkflowNotification({
    recipientUserId: input.ownerUserId,
    type: "PROJECT_ONBOARDING_APPROVED",
    projectId: project._id.toString(),
    reviewHistoryId: reviewEventId.toString(),
    projectNameSnapshot: project.name,
  });

  return project._id.toString();
}
