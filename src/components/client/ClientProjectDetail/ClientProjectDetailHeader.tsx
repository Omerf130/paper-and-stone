import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { formatIlsAgorot } from "@/lib/money/format-ils";
import type {
  ClientProjectApprovedDetailView,
  ClientProjectNoSnapshotDetailView,
  ClientProjectSnapshotUnavailableDetailView,
} from "@/types/client-project";
import styles from "./ClientProjectDetailHeader.module.scss";

type ClientProjectDetailHeaderProps = {
  projectName: string;
  architectFullName: string;
  presentationState: ClientProjectApprovedDetailView["presentationState"];
  approvedAt?: string;
  roomCount?: number;
  productCount?: number;
  clientProjectTotalAgorot?: number;
};

function formatApprovedDate(isoDate: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

export default function ClientProjectDetailHeader({
  projectName,
  architectFullName,
  presentationState,
  approvedAt,
  roomCount,
  productCount,
  clientProjectTotalAgorot,
}: ClientProjectDetailHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{projectName}</h1>
        <StatusBadge tone={presentationState.tone}>
          {presentationState.label}
        </StatusBadge>
      </div>

      <p className={styles.architect}>אדריכל: {architectFullName}</p>

      {(approvedAt || roomCount != null || productCount != null) && (
        <dl className={styles.meta}>
          {approvedAt ? (
            <div className={styles.metaRow}>
              <dt>תאריך אישור</dt>
              <dd>{formatApprovedDate(approvedAt)}</dd>
            </div>
          ) : null}

          {roomCount != null ? (
            <div className={styles.metaRow}>
              <dt>חדרים</dt>
              <dd>{roomCount}</dd>
            </div>
          ) : null}

          {productCount != null ? (
            <div className={styles.metaRow}>
              <dt>מוצרים</dt>
              <dd>{productCount}</dd>
            </div>
          ) : null}
        </dl>
      )}

      {clientProjectTotalAgorot != null ? (
        <p className={styles.total}>
          <span className={styles.totalLabel}>סה״כ הפרויקט המאושר</span>
          <span className={styles.totalValue}>
            {formatIlsAgorot(clientProjectTotalAgorot)}
          </span>
        </p>
      ) : null}
    </header>
  );
}

export function ClientProjectNoSnapshotContent({
  detail,
}: {
  detail:
    | ClientProjectNoSnapshotDetailView
    | ClientProjectSnapshotUnavailableDetailView;
}) {
  const message =
    detail.kind === "snapshot-unavailable"
      ? detail.presentationState.supportingText ??
        "לא ניתן להציג כרגע את פרטי הפרויקט המאושרים. ניתן לנסות שוב מאוחר יותר."
      : "הפרויקט בתהליך עבודה. פרטי המוצרים והמחירים יוצגו כאן לאחר אישור.";

  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyMessage}>{message}</p>
    </div>
  );
}
