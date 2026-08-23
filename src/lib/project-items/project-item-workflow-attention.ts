import { getNormalizedProjectItemStatus } from "@/lib/project-items/project-item-status-normalize";
import type { ProjectItemStatus } from "@/types/project-item-status";

export const ADMIN_WORKFLOW_ATTENTION_STATUSES = [
  "internal_review",
  "client_rejected",
  "resubmit",
] as const satisfies readonly ProjectItemStatus[];

export type AdminWorkflowAttentionStatus =
  (typeof ADMIN_WORKFLOW_ATTENTION_STATUSES)[number];

export const ARCHITECT_WORKFLOW_ACTION_STATUSES = [
  "client_rejected",
  "resubmit",
] as const satisfies readonly ProjectItemStatus[];

export const ARCHITECT_WORKFLOW_INFORMATIONAL_STATUSES = [
  "client_review",
] as const satisfies readonly ProjectItemStatus[];

type ItemWithStatus = {
  status?: ProjectItemStatus | null | undefined;
};

export type ProjectItemStatusCounts = Partial<Record<ProjectItemStatus, number>>;

export function countProjectItemsByStatus(
  items: ItemWithStatus[],
  statuses?: readonly ProjectItemStatus[],
): ProjectItemStatusCounts {
  const allowed = statuses ? new Set(statuses) : null;
  const counts: ProjectItemStatusCounts = {};

  for (const item of items) {
    const status = getNormalizedProjectItemStatus(
      item as Parameters<typeof getNormalizedProjectItemStatus>[0],
    );

    if (allowed && !allowed.has(status)) {
      continue;
    }

    counts[status] = (counts[status] ?? 0) + 1;
  }

  return counts;
}

function formatHebrewItemCount(count: number, singular: string, plural: string): string {
  if (count === 1) {
    return singular;
  }

  return `${count} ${plural}`;
}

export type WorkflowAttentionSummaryLine = {
  status: ProjectItemStatus;
  count: number;
  label: string;
};

export function getAdminWorkflowAttentionSummary(
  items: ItemWithStatus[],
): WorkflowAttentionSummaryLine[] {
  const counts = countProjectItemsByStatus(items, ADMIN_WORKFLOW_ATTENTION_STATUSES);
  const lines: WorkflowAttentionSummaryLine[] = [];

  const internalReviewCount = counts.internal_review ?? 0;
  if (internalReviewCount > 0) {
    lines.push({
      status: "internal_review",
      count: internalReviewCount,
      label: formatHebrewItemCount(
        internalReviewCount,
        "מוצר אחד בבדיקה פנימית",
        "מוצרים בבדיקה פנימית",
      ),
    });
  }

  const clientRejectedCount = counts.client_rejected ?? 0;
  if (clientRejectedCount > 0) {
    lines.push({
      status: "client_rejected",
      count: clientRejectedCount,
      label: formatHebrewItemCount(
        clientRejectedCount,
        "מוצר אחד נדחה על ידי הלקוח",
        "מוצרים נדחו על ידי הלקוח",
      ),
    });
  }

  const resubmitCount = counts.resubmit ?? 0;
  if (resubmitCount > 0) {
    lines.push({
      status: "resubmit",
      count: resubmitCount,
      label: formatHebrewItemCount(
        resubmitCount,
        "מוצר אחד דורש הגשה מחדש",
        "מוצרים דורשים הגשה מחדש",
      ),
    });
  }

  return lines;
}

export function projectHasAdminWorkflowAttention(items: ItemWithStatus[]): boolean {
  return getAdminWorkflowAttentionSummary(items).length > 0;
}

export type ArchitectWorkflowAttentionSummary = {
  actionRequired: WorkflowAttentionSummaryLine[];
  informational: WorkflowAttentionSummaryLine[];
};

export function getArchitectWorkflowAttentionSummary(
  items: ItemWithStatus[],
): ArchitectWorkflowAttentionSummary {
  const counts = countProjectItemsByStatus(items);
  const actionRequired: WorkflowAttentionSummaryLine[] = [];
  const informational: WorkflowAttentionSummaryLine[] = [];

  const clientRejectedCount = counts.client_rejected ?? 0;
  if (clientRejectedCount > 0) {
    actionRequired.push({
      status: "client_rejected",
      count: clientRejectedCount,
      label: formatHebrewItemCount(
        clientRejectedCount,
        "לקוח דחה מוצר אחד",
        "מוצרים נדחו על ידי הלקוח",
      ),
    });
  }

  const resubmitCount = counts.resubmit ?? 0;
  if (resubmitCount > 0) {
    actionRequired.push({
      status: "resubmit",
      count: resubmitCount,
      label: formatHebrewItemCount(
        resubmitCount,
        "מוצר אחד דורש טיפול",
        "מוצרים דורשים טיפול",
      ),
    });
  }

  const clientReviewCount = counts.client_review ?? 0;
  if (clientReviewCount > 0) {
    informational.push({
      status: "client_review",
      count: clientReviewCount,
      label: formatHebrewItemCount(
        clientReviewCount,
        "מוצר אחד ממתין לאישור לקוח",
        "מוצרים ממתינים לאישור לקוח",
      ),
    });
  }

  return { actionRequired, informational };
}

export function countClientReviewInWorkflowStatuses(
  workflowStatuses: Array<{ status: ProjectItemStatus }>,
): number {
  return workflowStatuses.filter((entry) => entry.status === "client_review").length;
}
