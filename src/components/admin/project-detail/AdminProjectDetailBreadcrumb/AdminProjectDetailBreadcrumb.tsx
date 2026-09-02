import Link from "next/link";
import styles from "./AdminProjectDetailBreadcrumb.module.scss";

type AdminProjectDetailBreadcrumbProps = {
  projectName: string;
};

export default function AdminProjectDetailBreadcrumb({
  projectName,
}: AdminProjectDetailBreadcrumbProps) {
  return (
    <nav className={styles.breadcrumb} aria-label="ניווט">
      <Link href="/admin/projects" className={styles.link}>
        פרויקטים
      </Link>
      <span className={styles.separator} aria-hidden="true">
        /
      </span>
      <span className={styles.current} aria-current="page">
        {projectName}
      </span>
    </nav>
  );
}
