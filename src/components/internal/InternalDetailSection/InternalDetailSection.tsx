import styles from "./InternalDetailSection.module.scss";

type InternalDetailSectionProps = {
  id?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export default function InternalDetailSection({
  id,
  title,
  description,
  actions,
  children,
}: InternalDetailSectionProps) {
  const titleId = id ?? title.replace(/\s+/g, "-").toLowerCase();

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <div className={styles.header}>
        <div className={styles.text}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
