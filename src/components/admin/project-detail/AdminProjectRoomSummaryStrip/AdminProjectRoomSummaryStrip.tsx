"use client";

import { buildRoomSummaryStatusSegments } from "@/lib/project-items/build-room-summary-metrics";
import {
  getRoomArchitectProfitTotalFormatted,
  getRoomClientTotalFormatted,
} from "@/lib/pricing/pricing-room-total-helpers";
import type { ProjectItemView } from "@/types/project";
import type { ProjectRoomView } from "@/types/project-room";
import styles from "./AdminProjectRoomSummaryStrip.module.scss";

type AdminProjectRoomSummaryStripProps = {
  room: ProjectRoomView | null;
  orphanLabel?: string;
  items: ProjectItemView[];
  isEditable?: boolean;
  onRename?: () => void;
  onDelete?: () => void;
};

const TONE_CLASS: Record<string, string> = {
  positive: styles.dotPositive,
  warning: styles.dotWarning,
  negative: styles.dotNegative,
  info: styles.dotInfo,
  neutral: styles.dotNeutral,
};

export default function AdminProjectRoomSummaryStrip({
  room,
  orphanLabel = "ללא חדר",
  items,
  isEditable = false,
  onRename,
  onDelete,
}: AdminProjectRoomSummaryStripProps) {
  const roomName = room?.name ?? orphanLabel;
  const clientTotal = getRoomClientTotalFormatted(items) ?? "—";
  const profitTotal = getRoomArchitectProfitTotalFormatted(items) ?? "—";
  const statusSegments = buildRoomSummaryStatusSegments(items);

  return (
    <div className={styles.strip} aria-label="סיכום חדר">
      <div className={styles.segment}>
        <span className={styles.segmentLabel}>חדר</span>
        <span className={styles.segmentValue}>
          {roomName}
          {isEditable && room ? (
            <span className={styles.roomActions}>
              {onRename ? (
                <button type="button" className={styles.iconButton} onClick={onRename}>
                  שינוי שם
                </button>
              ) : null}
              {onDelete ? (
                <button type="button" className={styles.iconButton} onClick={onDelete}>
                  מחיקה
                </button>
              ) : null}
            </span>
          ) : null}
        </span>
      </div>

      <span className={styles.separator} aria-hidden="true" />

      <div className={styles.segment}>
        <span className={styles.segmentLabel}>פריטים</span>
        <span className={styles.segmentValue}>{items.length}</span>
      </div>

      <span className={styles.separator} aria-hidden="true" />

      <div className={styles.segment}>
        <span className={styles.segmentLabel}>סה״כ לקוח</span>
        <span className={styles.segmentValue}>{clientTotal}</span>
      </div>

      <span className={styles.separator} aria-hidden="true" />

      <div className={styles.segment}>
        <span className={styles.segmentLabel}>רווח</span>
        <span className={styles.segmentValue}>{profitTotal}</span>
      </div>

      {statusSegments.map((segment) => (
        <div key={segment.status} className={styles.statusSegment}>
          <span className={styles.separator} aria-hidden="true" />
          <div className={styles.segment}>
            <span className={styles.statusLine}>
              <span
                className={`${styles.dot} ${TONE_CLASS[segment.tone] ?? styles.dotNeutral}`}
                aria-hidden="true"
              />
              <span className={styles.segmentValue}>
                {segment.count} {segment.label}
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
