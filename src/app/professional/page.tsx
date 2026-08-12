import type { Metadata } from "next";
import Link from "next/link";
import { requireProfessional } from "@/lib/auth/authorization";
import {
  getDisplayName,
  getProfileCompletenessSummary,
} from "@/lib/professionals/profile-completeness";
import { getMyProfessionalProfileView } from "@/lib/professionals/ensureProfessionalProfile";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "אזור מקצועי | Paper & Stone",
};

export default async function ProfessionalDashboardPage() {
  const user = await requireProfessional();
  const profile = await getMyProfessionalProfileView(user.id);
  const completeness = getProfileCompletenessSummary(profile);
  const displayName = getDisplayName(profile, user.email);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>שלום, {displayName}</h1>
        <p className={styles.description}>
          ברוכים הבאים לאזור המקצועי. כאן תוכלו לנהל את הפרופיל שלכם ולהיערך
          לפרויקטים עתידיים.
        </p>
      </header>

      <section className={styles.card} aria-labelledby="profile-status-title">
        <h2 id="profile-status-title" className={styles.cardTitle}>
          מצב הפרופיל
        </h2>
        <p className={styles.cardText}>
          {completeness.isComplete
            ? "הפרופיל שלכם מלא."
            : `הושלמו ${completeness.filledCount} מתוך ${completeness.totalCount} שדות.`}
        </p>
        {!completeness.isComplete && (
          <p className={styles.missingFields}>
            חסרים: {completeness.missingFields.join(", ")}
          </p>
        )}
        <Link href="/professional/profile" className={styles.primaryAction}>
          {completeness.isComplete ? "עריכת פרופיל" : "השלמת פרופיל"}
        </Link>
      </section>
    </div>
  );
}
