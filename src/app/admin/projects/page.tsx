import type { Metadata } from "next";
import Link from "next/link";
import AdminProjectsPagination from "@/components/admin/AdminProjectsPagination/AdminProjectsPagination";
import AdminProjectsToolbar from "@/components/admin/AdminProjectsToolbar/AdminProjectsToolbar";
import { getAdminProjects } from "@/lib/projects/getAdminProjects";
import { parseAdminProjectsParams } from "@/lib/projects/project-params";
import { getProjectStatusLabel } from "@/lib/projects/project-display-helpers";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "פרויקטים | Paper & Stone",
};

function formatDate(value?: string): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type AdminProjectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProjectsPage({
  searchParams,
}: AdminProjectsPageProps) {
  const resolvedSearchParams = await searchParams;
  const params = parseAdminProjectsParams(resolvedSearchParams);
  const result = await getAdminProjects(params);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>פרויקטים</h1>
          <p className={styles.description}>
            בדיקה ואישור פרויקטים שנשלחו על ידי אנשי מקצוע.
          </p>
        </div>
      </header>

      <AdminProjectsToolbar params={params} total={result.total} />

      {result.projects.length === 0 ? (
        <p className={styles.empty}>לא נמצאו פרויקטים.</p>
      ) : (
        <>
          <div className={styles.desktopOnly}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">פרויקט</th>
                    <th scope="col">איש מקצוע</th>
                    <th scope="col">סטטוס</th>
                    <th scope="col">מוצרים</th>
                    <th scope="col">נשלח</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {result.projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <div>{project.name}</div>
                        {project.clientName ? (
                          <div className={styles.subtle}>{project.clientName}</div>
                        ) : null}
                      </td>
                      <td>
                        <div dir="ltr">{project.professionalEmail}</div>
                        {project.professionalName ? (
                          <div className={styles.subtle}>{project.professionalName}</div>
                        ) : null}
                      </td>
                      <td>{getProjectStatusLabel(project.status)}</td>
                      <td>{project.itemCount}</td>
                      <td>{formatDate(project.submittedAt)}</td>
                      <td>
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className={styles.link}
                        >
                          פתיחה
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className={`${styles.mobileOnly} ${styles.cardList}`}>
            {result.projects.map((project) => (
              <li key={project.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <p className={styles.cardTitle}>{project.name}</p>
                  {project.clientName ? (
                    <p className={styles.cardMeta}>{project.clientName}</p>
                  ) : null}
                </div>

                <div className={styles.cardMetaGrid}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>איש מקצוע:</span>
                    <span className={styles.metaValue} dir="ltr">
                      {project.professionalEmail}
                    </span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>סטטוס:</span>
                    <span className={styles.metaValue}>
                      {getProjectStatusLabel(project.status)}
                    </span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>מוצרים:</span>
                    <span className={styles.metaValue}>{project.itemCount}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>נשלח:</span>
                    <span className={styles.metaValue}>
                      {formatDate(project.submittedAt)}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/admin/projects/${project.id}`}
                  className={styles.link}
                >
                  פתיחה
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <AdminProjectsPagination
        params={params}
        page={result.page}
        totalPages={result.totalPages}
      />
    </div>
  );
}
