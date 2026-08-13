import styles from "./SpinnerIcon.module.scss";

type SpinnerIconProps = {
  className?: string;
};

export default function SpinnerIcon({ className }: SpinnerIconProps) {
  return (
    <span
      className={[styles.spinner, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
