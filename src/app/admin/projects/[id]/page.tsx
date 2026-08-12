import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectReviewPanel from "@/components/admin/ProjectReviewPanel/ProjectReviewPanel";
import ProjectMessageReadMarker from "@/components/project-messages/ProjectMessageReadMarker/ProjectMessageReadMarker";
import ProjectMessageThread from "@/components/project-messages/ProjectMessageThread/ProjectMessageThread";
import {
  markAdminProjectMessagesReadAction,
  sendAdminProjectMessageAction,
} from "@/app/admin/projects/message-actions";
import { requireAdmin } from "@/lib/auth/authorization";
import { getProjectMessages } from "@/lib/project-messages/getProjectMessages";
import { hasEverBeenSubmitted } from "@/lib/projects/project-review-history";
import { getAdminProjectDetailView } from "@/lib/projects/getAdminProjects";
import {
  formatProjectItemSummary,
  getProjectReviewActionLabel,
  getProjectStatusLabel,
} from "@/lib/projects/project-display-helpers";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "פרויקט | Paper & Stone",
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

type AdminProjectDetailPageProps = PageProps<"/admin/projects/[id]">;

export default async function AdminProjectDetailPage({
  params,
}: AdminProjectDetailPageProps) {
  const user = await requireAdmin();
  const { id } = await params;
  const project = await getAdminProjectDetailView(id);

  if (!project) {
    notFound();
  }

  const messagingAvailable = hasEverBeenSubmitted({
    reviewHistory: project.reviewHistory.map((entry) => ({
      action: entry.action,
    })),
  });
  const messageThread = await getProjectMessages(user.id, "admin", id);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/admin/projects" className={styles.backLink}>
            חזרה לרשימה
          </Link>
          <h1 className={styles.title}>{project.name}</h1>
          <p className={styles.status}>{getProjectStatusLabel(project.status)}</p>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="professional-info-title">
        <h2 id="professional-info-title" className={styles.sectionTitle}>
          איש מקצוע
        </h2>
        <dl className={styles.metaList}>
          <div className={styles.metaItem}>
            <dt>אימייל</dt>
            <dd dir="ltr">{project.professionalEmail}</dd>
          </div>
          {project.professionalName ? (
            <div className={styles.metaItem}>
              <dt>שם</dt>
              <dd>{project.professionalName}</dd>
            </div>
          ) : null}
          <div className={styles.metaItem}>
            <dt>נשלח</dt>
            <dd>{formatDate(project.submittedAt)}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt>נבדק</dt>
            <dd>{formatDate(project.reviewedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="project-details-title">
        <h2 id="project-details-title" className={styles.sectionTitle}>
          פרטי פרויקט
        </h2>
        <dl className={styles.metaList}>
          {project.clientName ? (
            <div className={styles.metaItem}>
              <dt>לקוח</dt>
              <dd>{project.clientName}</dd>
            </div>
          ) : null}
          {project.location ? (
            <div className={styles.metaItem}>
              <dt>מיקום</dt>
              <dd>{project.location}</dd>
            </div>
          ) : null}
          {project.description ? (
            <div className={styles.metaItem}>
              <dt>תיאור</dt>
              <dd>{project.description}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="project-items-title">
        <h2 id="project-items-title" className={styles.sectionTitle}>
          מוצרים ({project.items.length})
        </h2>
        {project.items.length === 0 ? (
          <p className={styles.empty}>אין מוצרים בפרויקט.</p>
        ) : (
          <ul className={styles.itemList}>
            {project.items.map((item) => (
              <li key={item.id} className={styles.itemCard}>
                <p className={styles.itemName}>{item.snapshot.productName}</p>
                <p className={styles.itemSummary}>
                  {formatProjectItemSummary(item)}
                </p>
                {!item.isProductActive ? (
                  <p className={styles.staleBadge} role="status">
                    המוצר אינו פעיל
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {project.reviewHistory.length > 0 ? (
        <section className={styles.section} aria-labelledby="review-history-title">
          <h2 id="review-history-title" className={styles.sectionTitle}>
            היסטוריית בדיקה
          </h2>
          <ol className={styles.historyList}>
            {project.reviewHistory.map((entry, index) => (
              <li key={`${entry.createdAt}-${index}`} className={styles.historyItem}>
                <div className={styles.historyHeader}>
                  <span>{getProjectReviewActionLabel(entry.action)}</span>
                  <time dateTime={entry.createdAt}>
                    {formatDate(entry.createdAt)}
                  </time>
                </div>
                {entry.message ? (
                  <p className={styles.historyMessage}>{entry.message}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <ProjectMessageReadMarker
        projectId={project.id}
        messagingAvailable={messagingAvailable}
        markReadAction={markAdminProjectMessagesReadAction}
      />
      <ProjectMessageThread
        projectId={project.id}
        messages={messageThread.messages}
        messagingAvailable={messagingAvailable}
        truncated={messageThread.truncated}
        sendAction={sendAdminProjectMessageAction}
      />

      <ProjectReviewPanel projectId={project.id} status={project.status} />
    </div>
  );
}
