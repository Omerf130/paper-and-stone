import Link from "next/link";
import AdminPricingDeliveryPanel from "@/components/admin/project-detail/AdminPricingDeliveryPanel/AdminPricingDeliveryPanel";
import AdminProjectRoomAccordion from "@/components/admin/project-detail/AdminProjectRoomAccordion/AdminProjectRoomAccordion";
import AdminProjectItemPricingRow from "@/components/admin/project-detail/AdminProjectItemPricingRow/AdminProjectItemPricingRow";
import LayeredPricingTotalsSummary from "@/components/admin/project-detail/LayeredPricingTotalsSummary/LayeredPricingTotalsSummary";
import ProjectClientReassignPanel from "@/components/admin/project-detail/ProjectClientReassignPanel/ProjectClientReassignPanel";
import AdminProjectReviewHistory from "@/components/admin/project-detail/AdminProjectReviewHistory/AdminProjectReviewHistory";
import ProjectReviewPanel from "@/components/admin/ProjectReviewPanel/ProjectReviewPanel";
import AdminDetailSection from "@/components/admin/project-detail/AdminDetailSection/AdminDetailSection";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import AdminProjectWorkspaceMarkupHeader from "./AdminProjectWorkspaceMarkupHeader";
import type { AdminProjectDetailWithThumbnails } from "@/lib/projects/getAdminProjects";
import {
  mapOnboardingStatusToBadge,
  mapProjectStatusToBadge,
} from "@/lib/ui/map-status-badge";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { ONBOARDING_STATUS_LABELS, PROJECT_STATUS_LABELS } from "@/types/admin-project";
import styles from "./AdminProjectWorkspace.module.scss";

type AdminProjectWorkspaceProps = {
  project: AdminProjectDetailWithThumbnails;
};

export default function AdminProjectWorkspace({
  project,
}: AdminProjectWorkspaceProps) {
  const onboardingBadge = project.onboardingStatus
    ? mapOnboardingStatusToBadge(project.onboardingStatus)
    : null;
  const commercialBadge = mapProjectStatusToBadge(project.status);
  const clientLabel = project.assignedClientFullName ?? project.clientName ?? "—";
  const orphanItems = project.items.filter((item) => !item.roomId);
  const isPricingEditable = project.pricingSettings?.isAdminPricingEditable ?? false;
  const defaultMarkupAffectedCount = project.items.filter(
    (item) => item.adminPricing?.usesProjectAdminMarkup !== false,
  ).length;

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <h2 className={styles.projectName}>{project.name}</h2>
          <div className={styles.badges}>
            {onboardingBadge ? (
              <StatusBadge tone={onboardingBadge.tone}>
                {ONBOARDING_STATUS_LABELS[project.onboardingStatus!]}: {onboardingBadge.label}
              </StatusBadge>
            ) : null}
            <StatusBadge tone={commercialBadge.tone}>
              {PROJECT_STATUS_LABELS[project.status]}: {commercialBadge.label}
            </StatusBadge>
            {project.status === "approved" && project.commercialDirty ? (
              <StatusBadge tone="warning">אושר בעבר · השתנה מאז</StatusBadge>
            ) : null}
          </div>
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>חדרים</dt>
            <dd>{project.rooms.length}</dd>
          </div>
          <div>
            <dt>מוצרים</dt>
            <dd>{project.items.length}</dd>
          </div>
          <div>
            <dt>עודכן</dt>
            <dd>
              <time dateTime={project.updatedAt}>
                {formatDateTime(project.updatedAt)}
              </time>
            </dd>
          </div>
        </dl>
        {project.attentionReasons.length > 0 ? (
          <ul className={styles.attentionList} aria-label="דרוש טיפול">
            {project.attentionReasons.map((reason) => (
              <li key={reason}>
                <StatusBadge tone="warning">{reason}</StatusBadge>
              </li>
            ))}
          </ul>
        ) : null}
        {project.pricingAttention.incompleteItemCount > 0 ||
        project.pricingAttention.staleClientPriceCount > 0 ? (
          <p className={styles.pricingAttention}>
            {project.pricingAttention.incompleteItemCount > 0
              ? `${project.pricingAttention.incompleteItemCount} מוצרים ללא תמחור מלא · `
              : ""}
            {project.pricingAttention.staleClientPriceCount > 0
              ? `${project.pricingAttention.staleClientPriceCount} מחירי לקוח דורשים בדיקה`
              : ""}
          </p>
        ) : null}
      </header>

      <section className={styles.people} aria-labelledby="project-people-title">
        <h3 id="project-people-title" className={styles.sectionTitle}>
          אנשים
        </h3>
        <dl className={styles.peopleGrid}>
          <div>
            <dt>אדריכל</dt>
            <dd>{project.professionalName ?? project.professionalEmail}</dd>
            {project.professionalName ? (
              <dd className={styles.secondary} dir="ltr">
                {project.professionalEmail}
              </dd>
            ) : null}
          </div>
          <div>
            <dt>לקוח</dt>
            <dd>{clientLabel}</dd>
          </div>
        </dl>
        <div className={styles.reassign}>
          <ProjectClientReassignPanel project={project} />
        </div>
      </section>

      <AdminDetailSection
        id="project-rooms-workspace"
        title="חדרים ומוצרים"
        description="תמחור ישיר בשורת המוצר"
      >
        {project.pricingSettings ? (
          <AdminProjectWorkspaceMarkupHeader
            projectId={project.id}
            settings={project.pricingSettings}
            affectedItemCount={defaultMarkupAffectedCount}
          />
        ) : null}

        {project.rooms.length > 0 ? (
          <AdminProjectRoomAccordion
            projectId={project.id}
            rooms={project.rooms}
            items={project.items}
            pricingSettings={project.pricingSettings}
            productThumbnailsById={project.productThumbnailsById}
          />
        ) : (
          <p className={styles.emptyNotice}>
            אין חדרים בפרויקט. ניתן לתמחר מוצרים ללא שיוך חדר למטה.
          </p>
        )}

        {orphanItems.length > 0 ? (
          <section className={styles.orphanSection} aria-labelledby="orphan-items-title">
            <h4 id="orphan-items-title" className={styles.orphanTitle}>
              מוצרים ללא חדר
            </h4>
            <ul className={styles.orphanList}>
              {orphanItems.map((item) =>
                item.adminPricing ? (
                  <li key={item.id}>
                    <AdminProjectItemPricingRow
                      projectId={project.id}
                      item={{ ...item, adminPricing: item.adminPricing }}
                      defaultAdminMarkupPercent={
                        project.pricingSettings?.defaultAdminMarkupPercent
                      }
                      isEditable={isPricingEditable}
                      thumbnail={project.productThumbnailsById[item.productId]}
                    />
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        ) : null}

        {project.pricingTotals ? (
          <>
            {project.adminPricingRound ? (
              <AdminPricingDeliveryPanel
                projectId={project.id}
                pricingRound={project.adminPricingRound}
              />
            ) : null}
            <LayeredPricingTotalsSummary
            label="סיכום פרויקט"
            variant="project"
            idPrefix="project"
            internalCostTotalFormatted={
              project.pricingTotals.internalCostTotalFormatted
            }
            architectTotalFormatted={project.pricingTotals.architectTotalFormatted}
            clientTotalFormatted={project.pricingTotals.clientTotalFormatted}
            unpricedItemCount={project.pricingTotals.unpricedItemCount}
            staleItemCount={project.pricingTotals.staleItemCount}
          />
          </>
        ) : null}
      </AdminDetailSection>

      {project.status === "submitted" ? (
        <AdminDetailSection id="project-review" title="בדיקה מסחרית">
          <ProjectReviewPanel
            projectId={project.id}
            status={project.status}
            approvalBlockedReason={
              project.pricingApprovalBlockedReason ?? undefined
            }
          />
        </AdminDetailSection>
      ) : null}

      {project.reviewHistory.length > 0 ? (
        <AdminDetailSection id="review-history" title="היסטוריית בדיקות">
          <AdminProjectReviewHistory history={project.reviewHistory} />
        </AdminDetailSection>
      ) : null}

      <p className={styles.backLinkWrap}>
        <Link href="/admin/projects?queue=active" className={styles.backLink}>
          חזרה לפרויקטים פעילים
        </Link>
      </p>
    </div>
  );
}
