import styles from "./HexPreview.module.scss";

type HexPreviewProps = {
  hex: string;
  size?: "sm" | "md";
};

export default function HexPreview({ hex, size = "md" }: HexPreviewProps) {
  const classes =
    size === "sm"
      ? `${styles.preview} ${styles.previewSm}`
      : styles.preview;

  return (
    <span
      className={classes}
      style={{ backgroundColor: hex }}
      aria-hidden="true"
    />
  );
}
