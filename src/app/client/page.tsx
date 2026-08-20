import type { Metadata } from "next";
import Link from "next/link";
import { requireClient } from "@/lib/auth/authorization";
import { getClientDashboardData } from "@/lib/client-projects/getClientDashboardData";
import InternalPage from "@/components/internal/InternalPage/InternalPage";
import InternalPageHeader from "@/components/internal/InternalPageHeader/InternalPageHeader";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ClientProjectCard from "@/components/client/ClientProjectCard/ClientProjectCard";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "אזור לקוח | Paper & Stone",
};

export default async function ClientDashboardPage() {
  const user = await requireClient();
  const dashboard = await getClientDashboardData(user.id);

  return (
    <InternalPage width="default">
      <InternalPageHeader
        title={`שלום, ${dashboard.displayName}`}
        description="כאן תוכלו לראות את הפרויקטים שמשויכים לחשבון שלכם ואת הגרסאות המאושרות."
      />

      {dashboard.totalProjectCount > 0 ? (
        <div className={styles.summary}>
          <p className={styles.summaryItem}>
            {dashboard.totalProjectCount} פרויקטים משויכים
          </p>
          {dashboard.approvedSnapshotCount > 0 ? (
            <p className={styles.summaryItem}>
              {dashboard.approvedSnapshotCount} עם גרסה מאושרת
            </p>
          ) : null}
        </div>
      ) : null}

      <section className={styles.section} aria-labelledby="client-projects-title">
        <div className={styles.sectionHeader}>
          <h2 id="client-projects-title" className={styles.sectionTitle}>
            הפרויקטים שלי
          </h2>
          {dashboard.recentProjects.length > 0 ? (
            <Link href="/client/projects" className={styles.sectionLink}>
              כל הפרויקטים
            </Link>
          ) : null}
        </div>

        {dashboard.recentProjects.length === 0 ? (
          <EmptyState
            title="עדיין אין פרויקטים שמשויכים לחשבון שלך."
            description="כאשר ישויך אליכם פרויקט, הוא יופיע כאן."
          />
        ) : (
          <ul className={styles.projectList}>
            {dashboard.recentProjects.map((project) => (
              <li key={project.projectId}>
                <ClientProjectCard project={project} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </InternalPage>
  );
}
