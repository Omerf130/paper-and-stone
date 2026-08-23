import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireClient } from "@/lib/auth/authorization";
import { getClientProjectDetail } from "@/lib/client-projects/getClientProjectDetail";
import InternalPage from "@/components/internal/InternalPage/InternalPage";
import FeedbackBanner from "@/components/ui/FeedbackBanner/FeedbackBanner";
import Button from "@/components/ui/Button/Button";
import ClientProjectDetailHeader, {
  ClientProjectNoSnapshotContent,
} from "@/components/client/ClientProjectDetail/ClientProjectDetailHeader";
import ClientProjectRoomAccordion from "@/components/client/ClientProjectRoomAccordion/ClientProjectRoomAccordion";
import ClientProjectConversationSection from "@/components/client/ClientProjectConversationSection/ClientProjectConversationSection";
import styles from "./page.module.scss";

export async function generateMetadata({
  params,
}: PageProps<"/client/projects/[id]">): Promise<Metadata> {
  await params;

  return {
    title: "פרויקט | Paper & Stone",
  };
}

export default async function ClientProjectDetailPage({
  params,
}: PageProps<"/client/projects/[id]">) {
  const user = await requireClient();
  const { id } = await params;
  const detail = await getClientProjectDetail(user.id, id);

  if (!detail) {
    notFound();
  }

  const backLink = (
    <nav className={styles.backNav} aria-label="ניווט">
      <Button href="/client/projects" variant="ghost" size="sm">
        חזרה לפרויקטים
      </Button>
    </nav>
  );

  if (detail.kind === "no-snapshot" || detail.kind === "snapshot-unavailable") {
    return (
      <InternalPage width="default">
        {backLink}
        <ClientProjectDetailHeader
          projectName={detail.projectName}
          architectFullName={detail.architectFullName}
          presentationState={detail.presentationState}
        />
        <ClientProjectNoSnapshotContent detail={detail} />
        <ClientProjectConversationSection
          clientUserId={user.id}
          projectId={detail.projectId}
        />
      </InternalPage>
    );
  }

  return (
    <InternalPage width="default">
      {backLink}
      {detail.pendingReviewCount > 0 ? (
        <FeedbackBanner tone="warning" className={styles.updateBanner}>
          <strong>
            {detail.pendingReviewCount === 1
              ? "מוצר אחד ממתין לאישור שלך"
              : `${detail.pendingReviewCount} מוצרים ממתינים לאישור שלך`}
          </strong>
        </FeedbackBanner>
      ) : null}

      {detail.presentationState.isUpdating ? (
        <FeedbackBanner tone="info" className={styles.updateBanner}>
          <strong>הפרויקט נמצא בתהליך עדכון</strong>
          <p className={styles.updateBannerText}>
            {detail.presentationState.supportingText}
          </p>
        </FeedbackBanner>
      ) : null}

      <ClientProjectDetailHeader
        projectName={detail.snapshot.projectName}
        architectFullName={detail.snapshot.architect.fullName}
        presentationState={detail.presentationState}
        approvedAt={detail.snapshot.approvedAt}
        roomCount={detail.roomCount}
        productCount={detail.productCount}
        clientProjectTotalAgorot={detail.snapshot.clientProjectTotalAgorot}
      />

      <section aria-labelledby="client-rooms-title">
        <h2 id="client-rooms-title" className={styles.roomsTitle}>
          חדרים
        </h2>
        <ClientProjectRoomAccordion
          projectId={detail.projectId}
          rooms={detail.snapshot.rooms}
          workflowByItemId={detail.workflowByItemId}
        />
      </section>

      <ClientProjectConversationSection
        clientUserId={user.id}
        projectId={detail.projectId}
      />
    </InternalPage>
  );
}
