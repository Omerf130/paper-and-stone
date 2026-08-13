import styles from "./InternalPageHeader.module.scss";

type InternalPageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export default function InternalPageHeader({
  title,
  description,
  actions,
  children,
}: InternalPageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.main}>
        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {children ? <div className={styles.below}>{children}</div> : null}
    </header>
  );
}
