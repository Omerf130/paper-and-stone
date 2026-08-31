import type { IProjectItem } from "@/models/Project";
import {
  DEFAULT_PROJECT_ITEM_LOGISTICS_STATUS,
  PROJECT_ITEM_LOGISTICS_STATUS_LABELS,
  type ProjectItemLogisticsView,
} from "@/types/project-item-logistics";

export function mapProjectItemLogisticsView(
  item: Pick<IProjectItem, "logistics">,
  adminLabels?: Map<string, string>,
): ProjectItemLogisticsView {
  const status = item.logistics?.status ?? DEFAULT_PROJECT_ITEM_LOGISTICS_STATUS;
  const updatedByAdminUserId = item.logistics?.updatedByAdminUserId?.toString();

  return {
    status,
    statusLabel: PROJECT_ITEM_LOGISTICS_STATUS_LABELS[status],
    note: item.logistics?.note,
    updatedAt: item.logistics?.updatedAt?.toISOString(),
    updatedByAdminUserId,
    updatedByAdminLabel: updatedByAdminUserId
      ? adminLabels?.get(updatedByAdminUserId)
      : undefined,
  };
}
