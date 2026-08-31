import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import ProjectPayment, { type IProjectPayment } from "@/models/ProjectPayment";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_PAYMENT_ERRORS } from "@/types/project-payment";

function buildAdminPaymentProjectFilter(projectId: string) {
  return {
    _id: new Types.ObjectId(projectId),
    onboardingStatus: "active" as const,
    status: { $nin: ["rejected"] as const },
  };
}

async function assertAdminPaymentProjectExists(projectId: string): Promise<void> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PROJECT_PAYMENT_ERRORS.PROJECT_NOT_FOUND);
  }

  const project = await Project.findOne(buildAdminPaymentProjectFilter(projectId))
    .select("_id")
    .lean();

  if (!project) {
    throw new ProjectMutationError(PROJECT_PAYMENT_ERRORS.PROJECT_NOT_FOUND);
  }
}

export async function createProjectPaymentAsAdmin(
  adminUserId: string,
  input: {
    projectId: string;
    amountAgorot: number;
    paymentDate: Date;
    paymentMethod: IProjectPayment["paymentMethod"];
    note?: string;
  },
): Promise<string> {
  await assertAdminPaymentProjectExists(input.projectId);

  const payment = await ProjectPayment.create({
    projectId: new Types.ObjectId(input.projectId),
    amountAgorot: input.amountAgorot,
    paymentDate: input.paymentDate,
    paymentMethod: input.paymentMethod,
    note: input.note,
    createdByAdminUserId: new Types.ObjectId(adminUserId),
  });

  return payment._id.toString();
}

export async function updateProjectPaymentAsAdmin(
  adminUserId: string,
  input: {
    paymentId: string;
    projectId: string;
    amountAgorot: number;
    paymentDate: Date;
    paymentMethod: IProjectPayment["paymentMethod"];
    note?: string;
  },
): Promise<void> {
  await assertAdminPaymentProjectExists(input.projectId);

  if (!Types.ObjectId.isValid(input.paymentId)) {
    throw new ProjectMutationError(PROJECT_PAYMENT_ERRORS.NOT_FOUND);
  }

  const result = await ProjectPayment.updateOne(
    {
      _id: new Types.ObjectId(input.paymentId),
      projectId: new Types.ObjectId(input.projectId),
    },
    {
      $set: {
        amountAgorot: input.amountAgorot,
        paymentDate: input.paymentDate,
        paymentMethod: input.paymentMethod,
        note: input.note,
        updatedByAdminUserId: new Types.ObjectId(adminUserId),
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_PAYMENT_ERRORS.NOT_FOUND);
  }
}

export async function deleteProjectPaymentAsAdmin(
  projectId: string,
  paymentId: string,
): Promise<void> {
  await assertAdminPaymentProjectExists(projectId);

  if (!Types.ObjectId.isValid(paymentId)) {
    throw new ProjectMutationError(PROJECT_PAYMENT_ERRORS.NOT_FOUND);
  }

  const result = await ProjectPayment.deleteOne({
    _id: new Types.ObjectId(paymentId),
    projectId: new Types.ObjectId(projectId),
  });

  if (result.deletedCount === 0) {
    throw new ProjectMutationError(PROJECT_PAYMENT_ERRORS.NOT_FOUND);
  }
}
