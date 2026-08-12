import type { Metadata } from "next";
import Link from "next/link";
import { requireProfessional } from "@/lib/auth/authorization";
import { getMyProfessionalProfileView } from "@/lib/professionals/ensureProfessionalProfile";
import { isProfileReadyForProjects } from "@/lib/professionals/profile-readiness";
import ProjectForm from "@/components/professional/projects/ProjectForm/ProjectForm";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "יצירת פרויקט | Paper & Stone",
};

export default async function NewProjectPage() {
  const user = await requireProfessional();
  const profile = await getMyProfessionalProfileView(user.id);
  const profileReady = isProfileReadyForProjects(profile);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>יצירת פרויקט חדש</h1>
        <p className={styles.description}>
          הזינו את פרטי הפרויקט הבסיסיים. לאחר היצירה תוכלו להוסיף מוצרים.
        </p>
      </header>

      {!profileReady ? (
        <div className={styles.notice}>
          <p>
            יש להשלים שם מלא וטלפון בפרופיל לפני יצירת פרויקט.
          </p>
          <Link href="/professional/profile" className={styles.profileLink}>
            השלמת פרופיל
          </Link>
        </div>
      ) : (
        <ProjectForm
          mode="create"
          initialProject={{
            name: "",
            clientName: "",
            location: "",
            description: "",
          }}
        />
      )}
    </div>
  );
}
