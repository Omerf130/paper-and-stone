import Button from "@/components/ui/Button/Button";
import type { ProfileCompletenessSummary } from "@/types/professional-dashboard";
import styles from "./ProfessionalDashboardProfile.module.scss";

type ProfessionalDashboardProfileProps = {
  completeness: ProfileCompletenessSummary;
};

export default function ProfessionalDashboardProfile({
  completeness,
}: ProfessionalDashboardProfileProps) {
  return (
    <section className={styles.section} aria-labelledby="pro-profile-title">
      <h2 id="pro-profile-title" className={styles.title}>
        מצב הפרופיל
      </h2>
      <p className={styles.text}>
        {completeness.isComplete
          ? "הפרופיל שלכם מלא."
          : `הושלמו ${completeness.filledCount} מתוך ${completeness.totalCount} שדות.`}
      </p>
      {!completeness.isComplete ? (
        <p className={styles.missing}>
          חסרים: {completeness.missingFields.join(", ")}
        </p>
      ) : null}
      <div className={styles.actions}>
        <Button href="/professional/profile" variant="secondary" size="sm">
          {completeness.isComplete ? "עריכת פרופיל" : "השלמת פרופיל"}
        </Button>
      </div>
    </section>
  );
}
