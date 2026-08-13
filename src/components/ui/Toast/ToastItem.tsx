import type { ToastItem } from "./toast-types";
import styles from "./Toast.module.scss";

type ToastItemViewProps = {
  toast: ToastItem;
  onDismiss: (id: string) => void;
};

export default function ToastItemView({ toast, onDismiss }: ToastItemViewProps) {
  const isAssertive = toast.type === "error";

  return (
    <div
      className={[styles.toast, styles[toast.type]].filter(Boolean).join(" ")}
      role={isAssertive ? "alert" : "status"}
      aria-live={isAssertive ? "assertive" : "polite"}
    >
      <p className={styles.message}>{toast.message}</p>
      <button
        type="button"
        className={styles.close}
        onClick={() => onDismiss(toast.id)}
        aria-label="סגירה"
      >
        ×
      </button>
    </div>
  );
}
