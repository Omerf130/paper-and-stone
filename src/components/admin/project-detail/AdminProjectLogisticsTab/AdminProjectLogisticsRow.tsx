"use client";

import { useState, useTransition } from "react";
import { updateProjectItemLogisticsAction } from "@/app/admin/projects/logistics-actions";
import Button from "@/components/ui/Button/Button";
import { formatDateTime } from "@/lib/ui/format-date-time";
import type { ProjectItemView } from "@/types/project";
import {
  PROJECT_ITEM_LOGISTICS_STATUSES,
  PROJECT_ITEM_LOGISTICS_STATUS_LABELS,
  type ProjectItemLogisticsStatus,
} from "@/types/project-item-logistics";
import styles from "./AdminProjectLogisticsRow.module.scss";

type AdminProjectLogisticsRowProps = {
  projectId: string;
  item: ProjectItemView;
  roomName?: string;
};

export default function AdminProjectLogisticsRow({
  projectId,
  item,
  roomName,
}: AdminProjectLogisticsRowProps) {
  const initialStatus = item.logistics?.status ?? "not_ordered";
  const initialNote = item.logistics?.note ?? "";
  const [status, setStatus] = useState<ProjectItemLogisticsStatus>(initialStatus);
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const hasChanges =
    status !== initialStatus || note.trim() !== initialNote.trim();

  const handleSave = () => {
    setError(undefined);

    startTransition(async () => {
      const result = await updateProjectItemLogisticsAction({
        projectId,
        itemId: item.id,
        status,
        note,
      });

      if (result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <article className={styles.row}>
      <div>
        <p className={styles.productName}>{item.snapshot.productName}</p>
        {item.snapshot.sku ? (
          <p className={styles.sku}>{item.snapshot.sku}</p>
        ) : null}
      </div>

      <div>
        <p className={styles.cellLabel}>חדר</p>
        <p className={styles.cellValue}>{roomName ?? "ללא חדר"}</p>
      </div>

      <div>
        <p className={styles.cellLabel}>כמות</p>
        <p className={styles.cellValue}>{item.quantity}</p>
      </div>

      <div>
        <p className={styles.cellLabel}>ספק</p>
        <p className={styles.cellValue}>{item.supplierName ?? "—"}</p>
      </div>

      <div className={styles.field}>
        <label className={styles.cellLabel} htmlFor={`logistics-status-${item.id}`}>
          סטטוס
        </label>
        <select
          id={`logistics-status-${item.id}`}
          className={styles.select}
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as ProjectItemLogisticsStatus)
          }
          disabled={isPending}
        >
          {PROJECT_ITEM_LOGISTICS_STATUSES.map((option) => (
            <option key={option} value={option}>
              {PROJECT_ITEM_LOGISTICS_STATUS_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className={styles.cellLabel}>עדכון אחרון</p>
        <p className={styles.cellValue}>
          {item.logistics?.updatedAt
            ? formatDateTime(item.logistics.updatedAt)
            : "—"}
        </p>
      </div>

      <div className={styles.field}>
        <label className={styles.cellLabel} htmlFor={`logistics-note-${item.id}`}>
          הערה
        </label>
        <textarea
          id={`logistics-note-${item.id}`}
          className={styles.textarea}
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={isPending}
        />
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={handleSave}
          loading={isPending}
          loadingLabel="שומר..."
          disabled={!hasChanges}
        >
          שמירה
        </Button>
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
    </article>
  );
}
