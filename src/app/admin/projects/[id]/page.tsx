import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import AdminDetailSection from "@/components/admin/project-detail/AdminDetailSection/AdminDetailSection";
import AdminProjectItemsList from "@/components/admin/project-detail/AdminProjectItemsList/AdminProjectItemsList";
import AdminProjectOverview from "@/components/admin/project-detail/AdminProjectOverview/AdminProjectOverview";
import AdminProjectReviewHistory from "@/components/admin/project-detail/AdminProjectReviewHistory/AdminProjectReviewHistory";
import AdminQuotePanel from "@/components/admin/project-detail/AdminQuotePanel/AdminQuotePanel";
import AdminProjectWorkspace from "@/components/admin/project-detail/AdminProjectWorkspace/AdminProjectWorkspace";
import { resolveAdminProjectTabId } from "@/lib/projects/admin-project-tab-params";
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
import { getAdminArchitectClientProjectMessages } from "@/lib/project-messages/architect-client-messages";
import ProjectConversationThread from "@/components/project-messages/ProjectConversationThread/ProjectConversationThread";
import {
  getAdminProjectDetailViewWithThumbnails,
} from "@/lib/projects/getAdminProjects";
import { getAdminQuotePanelView } from "@/lib/quotes/quote-queries";
import { getReviewUnavailableCopy } from "@/lib/projects/project-display-helpers";
import { isMessagingAvailable } from "@/lib/projects/project-workspace-gates";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "פרויקט | Paper & Stone",
};

type AdminProjectDetailPageProps = PageProps<"/admin/projects/[id]">;

export default async function AdminProjectDetailPage({
  params,
  searchParams,
}: AdminProjectDetailPageProps) {
  const user = await requireAdmin();
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const initialTabId = resolveAdminProjectTabId(resolvedSearchParams.tab);
  const projectWithThumbnails = await getAdminProjectDetailViewWithThumbnails(id);

  if (!projectWithThumbnails) {
    notFound();
  }

  const isOnboardingPending = projectWithThumbnails.onboardingStatus === "pending_approval";
  const isOnboardingActive = projectWithThumbnails.onboardingStatus === "active";
  const isLegacyProject = projectWithThumbnails.onboardingStatus == null;
  const isActiveWorkspace =
    isOnboardingActive && projectWithThumbnails.usesRoomBasedWorkspace;

  const quotePanel =
    isOnboardingPending || isActiveWorkspace || (!isLegacyProject && !isOnboardingActive)
      ? null
      : await getAdminQuotePanelView(id);

  const messagingAvailable = isMessagingAvailable({
    status: projectWithThumbnails.status,
    onboardingStatus: projectWithThumbnails.onboardingStatus ?? undefined,
    reviewHistory: projectWithThumbnails.reviewHistory,
  });
  const messageThread = await getProjectMessages(user.id, "admin", id);
  const architectClientThread = await getAdminArchitectClientProjectMessages(id);

  if (isActiveWorkspace) {
    return (
      <AdminPage width="wide">
        <div className={styles.workspaceShell}>
          <ProjectMessageReadMarker
            projectId={projectWithThumbnails.id}
            messagingAvailable={messagingAvailable}
            markReadAction={markAdminProjectMessagesReadAction}
          />

          <AdminProjectWorkspace
            project={projectWithThumbnails}
            initialTabId={initialTabId}
          />
        </div>

        <AdminDetailSection id="project-messages" title="שיחה עם האדריכל">
          <ProjectMessageThread
            projectId={projectWithThumbnails.id}
            messages={messageThread.messages}
            messagingAvailable={messagingAvailable}
            truncated={messageThread.truncated}
            sendAction={sendAdminProjectMessageAction}
            variant="admin"
            hideTitle
          />
        </AdminDetailSection>

        <AdminDetailSection id="architect-client-messages" title="שיחת אדריכל ולקוח">
          <ProjectConversationThread
            projectId={projectWithThumbnails.id}
            sectionId="architect-client-messages"
            title="שיחת אדריכל ולקוח"
            messages={architectClientThread.messages}
            messagingAvailable
            unavailableMessage="אין שיחת אדריכל ולקוח לפרויקט זה."
            truncated={architectClientThread.truncated}
            readOnly
            readOnlyNotice="תצוגה בלבד — הודעות אלה אינן נספרות כנקראות עבורך."
            hideTitle
          />
        </AdminDetailSection>
      </AdminPage>
    );
  }

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title={projectWithThumbnails.name}
        actions={
          <Button href="/admin/projects" variant="ghost" size="sm">
            חזרה לפרויקטים
          </Button>
        }
      />

      <AdminDetailSection id="project-overview" title="סקירת פרויקט">
        <AdminProjectOverview project={projectWithThumbnails} />
      </AdminDetailSection>

      {isOnboardingPending ? (
        <AdminDetailSection id="onboarding-review" title="אישור פתיחה">
          <ProjectOnboardingReviewPanel project={projectWithThumbnails} />
        </AdminDetailSection>
      ) : null}

      {!isOnboardingPending ? (
        <AdminDetailSection
          id="project-items"
          title="מוצרים בפרויקט"
          description={`${projectWithThumbnails.items.length} מוצרים בפרויקט`}
        >
          {projectWithThumbnails.usesRoomBasedWorkspace ? null : (
            <AdminProjectItemsList items={projectWithThumbnails.items} />
          )}
        </AdminDetailSection>
      ) : null}

      {quotePanel ? (
        <AdminDetailSection id="project-pricing" title="תמחור / הצעת מחיר">
          <AdminQuotePanel panel={quotePanel} />
        </AdminDetailSection>
      ) : null}

      {!isOnboardingPending ? (
        <AdminDetailSection id="project-review" title="בדיקת פרויקט">
          {projectWithThumbnails.status === "submitted" ? (
            <ProjectReviewPanel
              projectId={projectWithThumbnails.id}
              status={projectWithThumbnails.status}
              approvalBlockedReason={
                quotePanel?.approvalBlockedReason ??
                projectWithThumbnails.pricingApprovalBlockedReason ??
                undefined
              }
            />
          ) : (
            <p className={styles.reviewUnavailable}>
              {getReviewUnavailableCopy(projectWithThumbnails.status)}
            </p>
          )}
        </AdminDetailSection>
      ) : null}

      {projectWithThumbnails.reviewHistory.length > 0 ? (
        <AdminDetailSection id="review-history" title="היסטוריית בדיקה">
          <AdminProjectReviewHistory history={projectWithThumbnails.reviewHistory} />
        </AdminDetailSection>
      ) : null}

      <ProjectMessageReadMarker
        projectId={projectWithThumbnails.id}
        messagingAvailable={messagingAvailable}
        markReadAction={markAdminProjectMessagesReadAction}
      />

      <AdminDetailSection id="project-messages" title="שיחה עם האדריכל">
        <ProjectMessageThread
          projectId={projectWithThumbnails.id}
          messages={messageThread.messages}
          messagingAvailable={messagingAvailable}
          truncated={messageThread.truncated}
          sendAction={sendAdminProjectMessageAction}
          variant="admin"
          hideTitle
        />
      </AdminDetailSection>

      <AdminDetailSection id="architect-client-messages" title="שיחת אדריכל ולקוח">
        <ProjectConversationThread
          projectId={projectWithThumbnails.id}
          sectionId="architect-client-messages"
          title="שיחת אדריכל ולקוח"
          messages={architectClientThread.messages}
          messagingAvailable
          unavailableMessage="אין שיחת אדריכל ולקוח לפרויקט זה."
          truncated={architectClientThread.truncated}
          readOnly
          readOnlyNotice="תצוגה בלבד — הודעות אלה אינן נספרות כנקראות עבורך."
          hideTitle
        />
      </AdminDetailSection>
    </AdminPage>
  );
}
