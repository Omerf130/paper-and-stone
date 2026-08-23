import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { getProjectItemWorkflowSettings } from "@/lib/project-items/get-project-item-workflow-settings";
import { getNormalizedProjectItemStatus } from "@/lib/project-items/project-item-status-normalize";
import {
  assertProjectItemStatusTransitionOrThrow,
  ProjectItemStatusError,
} from "@/lib/project-items/project-item-status-transition";
import {
  parseProjectItemStatusInput,
  PROJECT_ITEM_STATUS_ERRORS,
} from "@/lib/project-items/project-item-workflow-validation";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import Project, { type IProject } from "@/models/Project";
import type { ProjectItemStatusChangeRole } from "@/types/project-item-status";
import { isProjectItemInClientApprovedSnapshot } from "@/lib/client-snapshots/isProjectItemInClientApprovedSnapshot";

export type SetProjectItemStatusInput = {
  projectId: string;
  projectItemId: string;
  targetStatus: string;
};

type SetProjectItemStatusContext = {
  userId: string;
  role: ProjectItemStatusChangeRole;
  getProject: () => Promise<IProject | null>;
};

async function findProjectItem(
  project: IProject,
  projectItemId: string,
) {
  if (!Types.ObjectId.isValid(projectItemId)) {
    return null;
  }

  return (
    project.items.find((item) => item._id.toString() === projectItemId) ?? null
  );
}

export async function setProjectItemStatus(
  context: SetProjectItemStatusContext,
  input: SetProjectItemStatusInput,
): Promise<void> {
  const targetStatus = parseProjectItemStatusInput(input.targetStatus);

  if (!targetStatus) {
    throw new ProjectItemStatusError(PROJECT_ITEM_STATUS_ERRORS.INVALID_STATUS);
  }

  if (!Types.ObjectId.isValid(input.projectId)) {
    throw new ProjectItemStatusError(PROJECT_ITEM_STATUS_ERRORS.PROJECT_NOT_FOUND);
  }

  await connectDB();

  const project = await context.getProject();

  if (!project) {
    throw new ProjectItemStatusError(PROJECT_ITEM_STATUS_ERRORS.PROJECT_NOT_FOUND);
  }

  const item = await findProjectItem(project, input.projectItemId);

  if (!item) {
    throw new ProjectItemStatusError(PROJECT_ITEM_STATUS_ERRORS.ITEM_NOT_FOUND);
  }

  const currentStatus = getNormalizedProjectItemStatus(item);
  const settings = await getProjectItemWorkflowSettings();

  try {
    assertProjectItemStatusTransitionOrThrow({
      role: context.role,
      from: currentStatus,
      to: targetStatus,
      settings,
    });
  } catch (error) {
    if (error instanceof ProjectItemStatusError) {
      throw error;
    }

    throw new ProjectItemStatusError(
      PROJECT_ITEM_STATUS_ERRORS.TRANSITION_NOT_ALLOWED,
    );
  }

  const historyEntry = {
    from: currentStatus,
    to: targetStatus,
    changedByUserId: new Types.ObjectId(context.userId),
    changedByRole: context.role,
    changedAt: new Date(),
  };

  const result = await Project.updateOne(
    {
      _id: project._id,
      "items._id": new Types.ObjectId(input.projectItemId),
    },
    {
      $set: {
        "items.$.status": targetStatus,
      },
      $push: {
        "items.$.statusHistory": historyEntry,
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectItemStatusError(PROJECT_ITEM_STATUS_ERRORS.ITEM_NOT_FOUND);
  }
}

export async function setProjectItemStatusAsAdmin(
  adminUserId: string,
  input: SetProjectItemStatusInput,
): Promise<void> {
  try {
    await setProjectItemStatus(
      {
        userId: adminUserId,
        role: "admin",
        getProject: async () => {
          if (!Types.ObjectId.isValid(input.projectId)) {
            return null;
          }

          return Project.findById(input.projectId);
        },
      },
      input,
    );
  } catch (error) {
    if (error instanceof ProjectItemStatusError) {
      throw new ProjectMutationError(error.message);
    }

    throw error;
  }
}

export async function setProjectItemStatusAsArchitect(
  ownerUserId: string,
  input: SetProjectItemStatusInput,
): Promise<void> {
  try {
    await setProjectItemStatus(
      {
        userId: ownerUserId,
        role: "architect",
        getProject: async () => {
          if (!Types.ObjectId.isValid(input.projectId)) {
            return null;
          }

          return Project.findOne({
            _id: new Types.ObjectId(input.projectId),
            ownerUserId: new Types.ObjectId(ownerUserId),
          });
        },
      },
      input,
    );
  } catch (error) {
    if (error instanceof ProjectItemStatusError) {
      throw new ProjectMutationError(error.message);
    }

    throw error;
  }
}

export async function setProjectItemStatusAsClient(
  clientUserId: string,
  input: SetProjectItemStatusInput,
): Promise<void> {
  try {
    const isInSnapshot = await isProjectItemInClientApprovedSnapshot(
      clientUserId,
      input.projectId,
      input.projectItemId,
    );

    if (!isInSnapshot) {
      throw new ProjectMutationError(
        PROJECT_ITEM_STATUS_ERRORS.NOT_IN_CLIENT_SNAPSHOT,
      );
    }

    await setProjectItemStatus(
      {
        userId: clientUserId,
        role: "client",
        getProject: async () => {
          if (!Types.ObjectId.isValid(input.projectId)) {
            return null;
          }

          return Project.findOne({
            _id: new Types.ObjectId(input.projectId),
            clientUserId: new Types.ObjectId(clientUserId),
          });
        },
      },
      input,
    );
  } catch (error) {
    if (error instanceof ProjectItemStatusError) {
      throw new ProjectMutationError(error.message);
    }

    throw error;
  }
}

export function mapProjectItemStatusHistoryEntry(
  entry: NonNullable<IProject["items"][number]["statusHistory"]>[number],
) {
  return {
    from: entry.from,
    to: entry.to,
    changedByUserId: entry.changedByUserId.toString(),
    changedByRole: entry.changedByRole,
    changedAt: entry.changedAt.toISOString(),
  };
}
