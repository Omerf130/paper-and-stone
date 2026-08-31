"use client";

import type { ProjectPricingSettingsView } from "@/types/project-pricing";
import styles from "./AdminProjectWorkspaceMarkupHeader.module.scss";

type AdminProjectWorkspaceMarkupHeaderProps = {
  projectId: string;
  settings: ProjectPricingSettingsView;
  affectedItemCount: number;
};

/** @deprecated Pricing V2 removed project-level markup controls */
export default function AdminProjectWorkspaceMarkupHeader({
  settings,
}: AdminProjectWorkspaceMarkupHeaderProps) {
  if (!settings.usesLayeredPricing) {
    return null;
  }

  return (
    <section className={styles.settings} aria-labelledby="workspace-pricing-title">
      <h3 id="workspace-pricing-title" className={styles.title}>
        תמחור מסחרי
      </h3>
      {!settings.isAdminPricingEditable && settings.adminPricingUnavailableReason ? (
        <p className={styles.notice} role="status">
          {settings.adminPricingUnavailableReason}
        </p>
      ) : null}
    </section>
  );
}
