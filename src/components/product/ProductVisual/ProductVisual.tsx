import type { VisualTone } from "@/types/product";
import styles from "./ProductVisual.module.scss";

type ProductVisualProps = {
  tone: VisualTone;
  variant?: "default" | "hero";
  className?: string;
};

/**
 * Demo product visualization — NOT the final 2D variant rendering strategy.
 * Will be replaced by actual variant imagery or the chosen production approach.
 */
export default function ProductVisual({
  tone,
  variant = "default",
  className,
}: ProductVisualProps) {
  const toneClass =
    styles[`tone${tone.charAt(0).toUpperCase()}${tone.slice(1)}` as keyof typeof styles];
  const frameClass = variant === "hero" ? styles.frameHero : styles.frame;
  const sofaClass = variant === "hero" ? styles.sofaHero : styles.sofa;
  const classes = className
    ? `${frameClass} ${toneClass} ${className}`
    : `${frameClass} ${toneClass}`;

  return (
    <div className={classes} aria-hidden="true">
      <svg
        className={sofaClass}
        viewBox="0 0 400 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="20" y="140" width="360" height="24" rx="2" className={styles.base} />
        <rect x="40" y="60" width="320" height="80" rx="4" className={styles.seat} />
        <rect x="30" y="40" width="60" height="100" rx="4" className={styles.armLeft} />
        <rect x="310" y="40" width="60" height="100" rx="4" className={styles.armRight} />
        <rect x="50" y="20" width="300" height="50" rx="4" className={styles.back} />
        <rect x="60" y="70" width="90" height="50" rx="2" className={styles.cushion} />
        <rect x="155" y="70" width="90" height="50" rx="2" className={styles.cushion} />
        <rect x="250" y="70" width="90" height="50" rx="2" className={styles.cushion} />
      </svg>
    </div>
  );
}
