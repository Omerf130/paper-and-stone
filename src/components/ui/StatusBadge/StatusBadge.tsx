import styles from "./StatusBadge.module.scss";

export type StatusBadgeTone =
  | "neutral"
  | "positive"
  | "warning"
  | "negative"
  | "info";

type StatusBadgeProps = {
  tone?: StatusBadgeTone;
  children: React.ReactNode;
};

export default function StatusBadge({
  tone = "neutral",
  children,
}: StatusBadgeProps) {
  return <span className={styles[tone]}>{children}</span>;
}
