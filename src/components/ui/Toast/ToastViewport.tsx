import type { ToastItem } from "./toast-types";
import ToastItemView from "./ToastItem";
import styles from "./Toast.module.scss";

type ToastViewportProps = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

export default function ToastViewport({
  toasts,
  onDismiss,
}: ToastViewportProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.viewport}
      aria-label="הודעות מערכת"
    >
      <ul className={styles.list}>
        {toasts.map((toast) => (
          <li key={toast.id}>
            <ToastItemView toast={toast} onDismiss={onDismiss} />
          </li>
        ))}
      </ul>
    </div>
  );
}
