import ProjectReviewPanel from "@/components/admin/ProjectReviewPanel/ProjectReviewPanel";
import styles from "./AdminProjectCommercialReviewBanner.module.scss";

type AdminProjectCommercialReviewBannerProps = {
  projectId: string;
  approvalBlockedReason?: string;
};

export default function AdminProjectCommercialReviewBanner({
  projectId,
  approvalBlockedReason,
}: AdminProjectCommercialReviewBannerProps) {
  return (
    <section className={styles.banner} aria-labelledby="commercial-review-title">
      <h2 id="commercial-review-title" className={styles.title}>
        בדיקה מסחרית
      </h2>
      <ProjectReviewPanel
        projectId={projectId}
        status="submitted"
        approvalBlockedReason={approvalBlockedReason}
      />
    </section>
  );
}
