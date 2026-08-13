import styles from "./FeedbackBanner.module.scss";

export type FeedbackBannerTone = "info" | "success" | "warning" | "danger";

type FeedbackBannerProps = {
  tone?: FeedbackBannerTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export default function FeedbackBanner({
  tone = "info",
  title,
  children,
  className,
}: FeedbackBannerProps) {
  return (
    <section
      className={[styles[tone], className].filter(Boolean).join(" ")}
      role="status"
    >
      {title ? <h2 className={styles.title}>{title}</h2> : null}
      <div className={styles.content}>{children}</div>
    </section>
  );
}
