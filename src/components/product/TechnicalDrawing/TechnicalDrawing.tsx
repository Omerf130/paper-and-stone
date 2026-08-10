import type { ProductDimensionsView } from "@/types/product";
import styles from "./TechnicalDrawing.module.scss";

type TechnicalDrawingProps = {
  dimensions: ProductDimensionsView;
};

export default function TechnicalDrawing({ dimensions }: TechnicalDrawingProps) {
  const { width, depth, height, seatHeight } = dimensions;

  return (
    <div className={styles.frame} aria-hidden="true">
      <svg
        className={styles.drawing}
        viewBox="0 0 420 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="60"
          y="80"
          width="280"
          height="100"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <rect
          x="40"
          y="60"
          width="40"
          height="120"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <rect
          x="320"
          y="60"
          width="40"
          height="120"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <rect
          x="70"
          y="40"
          width="260"
          height="40"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />

        {width !== undefined ? (
          <>
            <line x1="40" y1="200" x2="360" y2="200" stroke="currentColor" strokeWidth="1" />
            <line x1="40" y1="195" x2="40" y2="205" stroke="currentColor" strokeWidth="1" />
            <line x1="360" y1="195" x2="360" y2="205" stroke="currentColor" strokeWidth="1" />
            <text x="200" y="220" textAnchor="middle" className={styles.label}>
              {width} cm
            </text>
          </>
        ) : null}

        {height !== undefined ? (
          <>
            <line x1="380" y1="60" x2="380" y2="180" stroke="currentColor" strokeWidth="1" />
            <line x1="375" y1="60" x2="385" y2="60" stroke="currentColor" strokeWidth="1" />
            <line x1="375" y1="180" x2="385" y2="180" stroke="currentColor" strokeWidth="1" />
            <text x="400" y="125" textAnchor="middle" className={styles.label} transform="rotate(90 400 125)">
              {height} cm
            </text>
          </>
        ) : null}

        {depth !== undefined ? (
          <>
            <line x1="60" y1="240" x2="340" y2="240" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
            <text x="200" y="258" textAnchor="middle" className={styles.labelSmall}>
              עומק {depth} cm
            </text>
          </>
        ) : null}

        {seatHeight !== undefined ? (
          <>
            <line x1="20" y1="180" x2="20" y2="200" stroke="currentColor" strokeWidth="1" />
            <text x="10" y="195" textAnchor="middle" className={styles.labelSmall} transform="rotate(-90 10 195)">
              {seatHeight} cm
            </text>
          </>
        ) : null}
      </svg>
    </div>
  );
}
