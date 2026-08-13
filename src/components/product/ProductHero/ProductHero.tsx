"use client";

import type { ReactNode } from "react";
import styles from "./ProductHero.module.scss";
import { useStickyWhenFits } from "./useStickyWhenFits";

type ProductHeroProps = {
  identity: ReactNode;
  media: ReactNode;
  controls: ReactNode;
};

export default function ProductHero({
  identity,
  media,
  controls,
}: ProductHeroProps) {
  const { ref, canStick } = useStickyWhenFits<HTMLDivElement>();

  const asideInnerClasses = canStick
    ? `${styles.asideInner} ${styles.asideSticky}`
    : styles.asideInner;

  return (
    <div className={styles.hero}>
      <div className={styles.media}>{media}</div>
      <aside className={styles.aside} aria-label="פרטי מוצר והגדרות">
        <div ref={ref} className={asideInnerClasses}>
          <div className={styles.identity}>{identity}</div>
          <div className={styles.controls}>{controls}</div>
        </div>
      </aside>
    </div>
  );
}
