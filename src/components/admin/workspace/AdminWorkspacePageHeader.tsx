import type { ReactNode } from "react";
import styles from "./AdminWorkspacePageHeader.module.scss";

type AdminWorkspacePageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  below?: ReactNode;
};

export default function AdminWorkspacePageHeader({
  title,
  description,
  actions,
  below,
}: AdminWorkspacePageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {below ? <div className={styles.below}>{below}</div> : null}
    </header>
  );
}
