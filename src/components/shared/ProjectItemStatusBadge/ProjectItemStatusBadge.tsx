import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { getProjectItemStatusPresentation } from "@/lib/project-items/project-item-status-presentation";
import type {
  ProjectItemStatus,
  ProjectItemStatusPresentation,
} from "@/types/project-item-status";
import type { ProjectItemStatusPresentationRole } from "@/lib/project-items/project-item-status-presentation";
import styles from "./ProjectItemStatusBadge.module.scss";

type ProjectItemStatusBadgeProps = {
  status: ProjectItemStatus;
  role?: ProjectItemStatusPresentationRole;
  presentation?: ProjectItemStatusPresentation;
  size?: "default" | "prominent" | "compact";
};

export default function ProjectItemStatusBadge({
  status,
  role = "admin",
  presentation,
  size = "default",
}: ProjectItemStatusBadgeProps) {
  const resolved =
    presentation ?? getProjectItemStatusPresentation(status, role);

  const badge = (
    <StatusBadge tone={resolved.tone}>{resolved.label}</StatusBadge>
  );

  if (size === "prominent") {
    return <span className={styles.prominent}>{badge}</span>;
  }

  if (size === "compact") {
    return <span className={styles.compact}>{badge}</span>;
  }

  return badge;
}
