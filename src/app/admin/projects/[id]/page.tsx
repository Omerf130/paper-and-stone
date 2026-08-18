import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import AdminDetailSection from "@/components/admin/project-detail/AdminDetailSection/AdminDetailSection";
import AdminProjectItemsList from "@/components/admin/project-detail/AdminProjectItemsList/AdminProjectItemsList";
import AdminProjectRoomsPanel from "@/components/admin/project-detail/AdminProjectRoomsPanel/AdminProjectRoomsPanel";
import AdminProjectOverview from "@/components/admin/project-detail/AdminProjectOverview/AdminProjectOverview";
import AdminProjectReviewHistory from "@/components/admin/project-detail/AdminProjectReviewHistory/AdminProjectReviewHistory";
import AdminQuotePanel from "@/components/admin/project-detail/AdminQuotePanel/AdminQuotePanel";
import ProjectClientReassignPanel from "@/components/admin/project-detail/ProjectClientReassignPanel/ProjectClientReassignPanel";
import ProjectOnboardingReviewPanel from "@/components/admin/project-detail/ProjectOnboardingReviewPanel/ProjectOnboardingReviewPanel";
import ProjectReviewPanel from "@/components/admin/ProjectReviewPanel/ProjectReviewPanel";
import ProjectMessageReadMarker from "@/components/project-messages/ProjectMessageReadMarker/ProjectMessageReadMarker";
import ProjectMessageThread from "@/components/project-messages/ProjectMessageThread/ProjectMessageThread";
import {
  markAdminProjectMessagesReadAction,
  sendAdminProjectMessageAction,
} from "@/app/admin/projects/message-actions";
import { requireAdmin } from "@/lib/auth/authorization";
import { getProjectMessages } from "@/lib/project-messages/getProjectMessages";
import { getAdminProjectDetailView } from "@/lib/projects/getAdminProjects";
import { getAdminQuotePanelView } from "@/lib/quotes/quote-queries";
import { getReviewUnavailableCopy } from "@/lib/projects/project-display-helpers";
import { isMessagingAvailable } from "@/lib/projects/project-workspace-gates";
import { formatDateTime } from "@/lib/ui/format-date-time";
import {
  mapOnboardingStatusToBadge,
  mapProjectStatusToBadge,
} from "@/lib/ui/map-status-badge";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "פרויקט | Paper & Stone",
};

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

  const isOnboardingPending = project.onboardingStatus === "pending_approval";
  const isOnboardingActive = project.onboardingStatus === "active";
  const isLegacyProject = project.onboardingStatus == null;

  const quotePanel =
    isOnboardingPending || (!isLegacyProject && !isOnboardingActive)
      ? null
      : await getAdminQuotePanelView(id);

  const messagingAvailable = isMessagingAvailable({
    status: project.status,
    onboardingStatus: project.onboardingStatus ?? undefined,
    reviewHistory: project.reviewHistory,
  });
  const messageThread = await getProjectMessages(user.id, "admin", id);
  const unreadMessageCount = messageThread.messages.filter(
    (message) => !message.isOwnMessage && !message.isReadForCurrentUser,
  ).length;
  const statusBadge = mapProjectStatusToBadge(project.status);
  const onboardingBadge = project.onboardingStatus
    ? mapOnboardingStatusToBadge(project.onboardingStatus)
    : null;

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title={project.name}
        actions={
          <Button href="/admin/projects" variant="ghost" size="sm">
            חזרה לפרויקטים
          </Button>
        }
      >
        <div className={styles.metaStrip}>
          {onboardingBadge ? (
            <StatusBadge tone={onboardingBadge.tone}>
              {onboardingBadge.label}
            </StatusBadge>
          ) : (
            <StatusBadge tone={statusBadge.tone}>{statusBadge.label}</StatusBadge>
          )}
          <span className={styles.metaItem}>
            {project.professionalName ?? project.professionalEmail}
          </span>
          {!isOnboardingPending ? (
            <span className={styles.metaItem}>
              {project.items.length} מוצרים
            </span>
          ) : null}
          {project.assignedClientFullName ? (
            <span className={styles.metaItem}>
              לקוח: {project.assignedClientFullName}
            </span>
          ) : null}
          {project.submittedAt ? (
            <span className={styles.metaItem}>
              נשלח{" "}
              <time dateTime={project.submittedAt}>
                {formatDateTime(project.submittedAt)}
              </time>
            </span>
          ) : null}
          <span className={styles.metaItem}>
            עודכן{" "}
            <time dateTime={project.updatedAt}>
              {formatDateTime(project.updatedAt)}
            </time>
          </span>
          {unreadMessageCount > 0 ? (
            <Link href="#messages" className={styles.unreadLink}>
              {unreadMessageCount} הודעות שלא נקראו
            </Link>
          ) : null}
          {quotePanel?.currentQuote ? (
            <Link href="#project-pricing" className={styles.unreadLink}>
              {`הצעה ${quotePanel.currentQuote.statusLabel}`}
            </Link>
          ) : null}
        </div>
      </AdminPageHeader>

      <AdminDetailSection id="project-overview" title="סקירת פרויקט">
        <AdminProjectOverview project={project} />
      </AdminDetailSection>

      {isOnboardingPending ? (
        <AdminDetailSection id="onboarding-review" title="אישור פתיחה">
          <ProjectOnboardingReviewPanel project={project} />
        </AdminDetailSection>
      ) : null}

      {isOnboardingActive ? (
        <AdminDetailSection id="client-assignment" title="לקוח משויך">
          <ProjectClientReassignPanel project={project} />
        </AdminDetailSection>
      ) : null}

      {!isOnboardingPending ? (
        <AdminDetailSection
          id="project-items"
          title="מוצרים בפרויקט"
          description={`${project.items.length} מוצרים בפרויקט`}
        >
          {project.usesRoomBasedWorkspace ? (
            <AdminProjectRoomsPanel
              rooms={project.rooms}
              items={project.items}
            />
          ) : (
            <AdminProjectItemsList items={project.items} />
          )}
        </AdminDetailSection>
      ) : null}

      {quotePanel ? (
        <AdminDetailSection
          id="project-pricing"
          title="תמחור / הצעת מחיר"
        >
          <AdminQuotePanel panel={quotePanel} />
        </AdminDetailSection>
      ) : null}

      {!isOnboardingPending ? (
        <AdminDetailSection id="project-review" title="בדיקת פרויקט">
          {project.status === "submitted" ? (
            <ProjectReviewPanel
              projectId={project.id}
              status={project.status}
              approvalBlockedReason={quotePanel?.approvalBlockedReason}
            />
          ) : (
            <p className={styles.reviewUnavailable}>
              {getReviewUnavailableCopy(project.status)}
            </p>
          )}
        </AdminDetailSection>
      ) : null}

      {project.reviewHistory.length > 0 ? (
        <AdminDetailSection id="review-history" title="היסטוריית בדיקה">
          <AdminProjectReviewHistory history={project.reviewHistory} />
        </AdminDetailSection>
      ) : null}

      <ProjectMessageReadMarker
        projectId={project.id}
        messagingAvailable={messagingAvailable}
        markReadAction={markAdminProjectMessagesReadAction}
      />

      <AdminDetailSection id="project-messages" title="שיחה על הפרויקט">
        <ProjectMessageThread
          projectId={project.id}
          messages={messageThread.messages}
          messagingAvailable={messagingAvailable}
          truncated={messageThread.truncated}
          sendAction={sendAdminProjectMessageAction}
          variant="admin"
          hideTitle
        />
      </AdminDetailSection>
    </AdminPage>
  );
}
