"use client";

import styles from "./AdminProjectItemRowActions.module.scss";

type AdminProjectItemRowActionsProps = {
  showMove?: boolean;
  onMove?: () => void;
  onRemove?: () => void;
};

export default function AdminProjectItemRowActions({
  showMove = false,
  onMove,
  onRemove,
}: AdminProjectItemRowActionsProps) {
  if (!showMove && !onRemove) {
    return null;
  }

  return (
    <details className={styles.menu}>
      <summary className={styles.trigger} aria-label="פעולות פריט">
        ⋯
      </summary>
      <div className={styles.panel}>
        {showMove && onMove ? (
          <button type="button" className={styles.item} onClick={onMove}>
            העברה
          </button>
        ) : null}
        {onRemove ? (
          <button type="button" className={styles.item} onClick={onRemove}>
            הסרה
          </button>
        ) : null}
      </div>
    </details>
  );
}
