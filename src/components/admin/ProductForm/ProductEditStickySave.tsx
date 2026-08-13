"use client";

import Button from "@/components/ui/Button/Button";
import { useProductFormActions } from "./ProductFormActionsContext";
import styles from "./ProductEditStickySave.module.scss";

export default function ProductEditStickySave() {
  const actions = useProductFormActions();

  if (!actions) {
    return null;
  }

  return (
    <div className={styles.bar} role="region" aria-label="שמירת מוצר">
      <div className={styles.inner}>
        <Button
          onClick={actions.submit}
          loading={actions.isPending}
          loadingLabel="שומר..."
        >
          שמירה
        </Button>
      </div>
    </div>
  );
}
