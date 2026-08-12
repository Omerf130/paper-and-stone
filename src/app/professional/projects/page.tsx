import type { Metadata } from "next";
import Link from "next/link";
import { requireProfessional } from "@/lib/auth/authorization";
import { getProfessionalProjects } from "@/lib/projects/project-queries";
import { getProjectStatusLabel } from "@/lib/projects/project-display-helpers";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "הפרויקטים שלי | Paper & Stone",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ProfessionalProjectsPage() {
  const user = await requireProfessional();
  const projects = await getProfessionalProjects(user.id);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>הפרויקטים שלי</h1>
          <p className={styles.description}>
            ניהול פרויקטים ומוצרים שנבחרו עבור לקוחות.
          </p>
        </div>
        <Link href="/professional/projects/new" className={styles.createLink}>
          יצירת פרויקט חדש
        </Link>
      </header>

      {projects.length === 0 ? (
        <p className={styles.empty}>עדיין לא יצרת פרויקטים.</p>
      ) : (
        <>
          <div className={styles.desktopOnly}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">שם פרויקט</th>
                    <th scope="col">סטטוס</th>
                    <th scope="col">מוצרים</th>
                    <th scope="col">עודכן</th>
                    <th scope="col">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <div>{project.name}</div>
                        {project.clientName ? (
                          <div className={styles.subtle}>{project.clientName}</div>
                        ) : null}
                        {(project.unreadMessageCount ?? 0) > 0 ? (
                          <div className={styles.unreadBadge} role="status">
                            הודעות חדשות: {project.unreadMessageCount}
                          </div>
                        ) : null}
                      </td>
                      <td>{getProjectStatusLabel(project.status)}</td>
                      <td>{project.itemCount}</td>
                      <td>{formatDate(project.updatedAt)}</td>
                      <td>
                        <Link
                          href={`/professional/projects/${project.id}`}
                          className={styles.editLink}
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

          <div className={styles.mobileOnly}>
            <ul className={styles.cardList}>
              {projects.map((project) => (
                <li key={project.id}>
                  <article className={styles.card}>
                    <h2 className={styles.cardTitle}>{project.name}</h2>
                    {project.clientName ? (
                      <p className={styles.cardMeta}>{project.clientName}</p>
                    ) : null}
                    <p className={styles.cardMeta}>
                      {getProjectStatusLabel(project.status)} · {project.itemCount}{" "}
                      מוצרים
                    </p>
                    <p className={styles.cardMeta}>
                      עודכן: {formatDate(project.updatedAt)}
                    </p>
                    {(project.unreadMessageCount ?? 0) > 0 ? (
                      <p className={styles.unreadBadge} role="status">
                        הודעות חדשות: {project.unreadMessageCount}
                      </p>
                    ) : null}
                    <Link
                      href={`/professional/projects/${project.id}`}
                      className={styles.editLink}
                    >
                      פתיחה
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
