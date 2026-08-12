import { Types } from "mongoose";
import type {
  IProject,
  IProjectReviewHistoryEntry,
} from "@/models/Project";
import type {
  ProjectReviewAction,
  ProjectReviewActorRole,
  ProjectReviewHistoryEntry,
  ProjectStatus,
} from "@/types/project";

export type BuildReviewHistoryEntryInput = {
  action: ProjectReviewAction;
  fromStatus: ProjectStatus;
  toStatus: ProjectStatus;
  actorUserId: string;
  actorRole: ProjectReviewActorRole;
  message?: string;
};

export function buildReviewHistoryEntry(
  input: BuildReviewHistoryEntryInput,
): IProjectReviewHistoryEntry {
  const entry: IProjectReviewHistoryEntry = {
    action: input.action,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    actorUserId: new Types.ObjectId(input.actorUserId),
    actorRole: input.actorRole,
    createdAt: new Date(),
  };

  const trimmedMessage = input.message?.trim();
  if (trimmedMessage) {
    entry.message = trimmedMessage;
  }

  return entry;
}

export function mapReviewHistoryEntryToView(
  entry: IProjectReviewHistoryEntry & { _id?: Types.ObjectId },
): ProjectReviewHistoryEntry {
  return {
    action: entry.action,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    message: entry.message,
    actorUserId: entry.actorUserId.toString(),
    actorRole: entry.actorRole,
    createdAt: entry.createdAt.toISOString(),
  };
}

export function getLatestAdminFeedback(
  history: Pick<ProjectReviewHistoryEntry, "action" | "message" | "createdAt">[],
): ProjectReviewHistoryEntry | null {
  const feedbackActions = new Set<ProjectReviewAction>([
    "changes_requested",
    "rejected",
  ]);

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const entry = history[index];
    if (feedbackActions.has(entry.action) && entry.message?.trim()) {
      return entry as ProjectReviewHistoryEntry;
    }
  }

  return null;
}

export function hasEverBeenSubmitted(
  project: {
    reviewHistory: Array<Pick<IProjectReviewHistoryEntry, "action">>;
  },
): boolean {
  return project.reviewHistory.some(
    (entry) => entry.action === "submitted" || entry.action === "resubmitted",
  );
}
