import AdminPricingDeliveryPanel from "@/components/admin/project-detail/AdminPricingDeliveryPanel/AdminPricingDeliveryPanel";
import AdminProjectItemPricingRow from "@/components/admin/project-detail/AdminProjectItemPricingRow/AdminProjectItemPricingRow";
import AdminProjectPricingSettings from "@/components/admin/project-detail/AdminProjectPricingSettings/AdminProjectPricingSettings";
import AdminProjectRoomAccordion from "@/components/admin/project-detail/AdminProjectRoomAccordion/AdminProjectRoomAccordion";
import LayeredPricingTotalsSummary from "@/components/admin/project-detail/LayeredPricingTotalsSummary/LayeredPricingTotalsSummary";
import type { AdminProjectDetailWithThumbnails } from "@/lib/projects/getAdminProjects";
import styles from "./AdminProjectCostsTab.module.scss";

type AdminProjectCostsTabProps = {
  project: AdminProjectDetailWithThumbnails;
};

export default function AdminProjectCostsTab({ project }: AdminProjectCostsTabProps) {
  const orphanItems = project.items.filter((item) => !item.roomId);
  const isPricingEditable = project.pricingSettings?.isAdminPricingEditable ?? false;

  return (
    <div className={styles.tab}>
      {project.pricingSettings ? (
        <AdminProjectPricingSettings
          projectId={project.id}
          settings={project.pricingSettings}
        />
      ) : null}

      <section className={styles.workspace} aria-labelledby="costs-workspace-title">
        <h2 id="costs-workspace-title" className={styles.workspaceTitle}>
          תמחור מוצרים
        </h2>

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
          <section className={styles.orphanSection} aria-labelledby="costs-orphan-items-title">
            <h3 id="costs-orphan-items-title" className={styles.orphanTitle}>
              מוצרים ללא חדר
            </h3>
            <ul className={styles.orphanList}>
              {orphanItems.map((item) =>
                item.adminPricing ? (
                  <li key={item.id}>
                    <AdminProjectItemPricingRow
                      projectId={project.id}
                      item={{ ...item, adminPricing: item.adminPricing }}
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
              idPrefix="project-costs"
              internalCostTotalFormatted={
                project.pricingTotals.internalCostTotalFormatted
              }
              commercialMarginTotalFormatted={
                project.pricingTotals.commercialMarginTotalFormatted
              }
              paperStoneProfitTotalFormatted={
                project.pricingTotals.paperStoneProfitTotalFormatted
              }
              architectProfitTotalFormatted={
                project.pricingTotals.architectProfitTotalFormatted
              }
              clientSubtotalFormatted={project.pricingTotals.clientSubtotalFormatted}
              vatAmountFormatted={project.pricingTotals.vatAmountFormatted}
              clientTotalInclVatFormatted={
                project.pricingTotals.clientTotalInclVatFormatted
              }
              unpricedItemCount={project.pricingTotals.unpricedItemCount}
              needsReviewItemCount={project.pricingTotals.needsReviewItemCount}
            />
          </>
        ) : null}
      </section>
    </div>
  );
}
