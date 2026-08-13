import { formatDateTime } from "@/lib/ui/format-date-time";
import type { AdminProjectDetailView } from "@/types/admin-project";
import styles from "./AdminProjectOverview.module.scss";

type AdminProjectOverviewProps = {
  project: AdminProjectDetailView;
};

type OverviewRow = {
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
};

function buildOverviewRows(project: AdminProjectDetailView): OverviewRow[] {
  const rows: OverviewRow[] = [];

  if (project.professionalName) {
    rows.push({ label: "איש מקצוע", value: project.professionalName });
  }

  rows.push({
    label: "אימייל",
    value: project.professionalEmail,
    dir: "ltr",
  });

  rows.push({
    label: "נוצר",
    value: formatDateTime(project.createdAt),
  });

  rows.push({
    label: "עודכן",
    value: formatDateTime(project.updatedAt),
  });

  if (project.submittedAt) {
    rows.push({
      label: "נשלח",
      value: formatDateTime(project.submittedAt),
    });
  }

  if (project.reviewedAt) {
    rows.push({
      label: "נבדק",
      value: formatDateTime(project.reviewedAt),
    });
  }

  if (project.clientName) {
    rows.push({ label: "לקוח", value: project.clientName });
  }

  if (project.location) {
    rows.push({ label: "מיקום", value: project.location });
  }

  return rows;
}

export default function AdminProjectOverview({
  project,
}: AdminProjectOverviewProps) {
  const rows = buildOverviewRows(project);

  return (
    <dl className={styles.list}>
      {rows.map((row) => (
        <div key={row.label} className={styles.item}>
          <dt className={styles.label}>{row.label}</dt>
          <dd className={styles.value} dir={row.dir}>
            {row.value}
          </dd>
        </div>
      ))}
      {project.description ? (
        <div className={styles.descriptionBlock}>
          <dt className={styles.label}>תיאור</dt>
          <dd className={styles.description}>{project.description}</dd>
        </div>
      ) : null}
    </dl>
  );
}
