"use client";

import { useState } from "react";
import styles from "./ArchitectRequestBanner.module.scss";

type ArchitectRequestBannerProps = {
  show: boolean;
};

export default function ArchitectRequestBanner({
  show,
}: ArchitectRequestBannerProps) {
  const [visible, setVisible] = useState(show);

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.banner} role="status">
      <p className={styles.message}>
        החשבון נוצר בהצלחה. בקשתך להרשאת אדריכל ממתינה לאישור מנהל המערכת.
      </p>
      <button
        type="button"
        className={styles.dismiss}
        onClick={() => setVisible(false)}
        aria-label="סגירת הודעה"
      >
        סגירה
      </button>
    </div>
  );
}
