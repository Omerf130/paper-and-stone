import type { Metadata } from "next";
import { requireProfessional } from "@/lib/auth/authorization";
import { getMyProfessionalProfileView } from "@/lib/professionals/ensureProfessionalProfile";
import { toProfileFormInput } from "@/lib/professionals/profile-completeness";
import ProfessionalProfileForm from "@/components/professional/ProfessionalProfileForm/ProfessionalProfileForm";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "הפרופיל שלי | Paper & Stone",
};

type ProfessionalProfilePageProps = PageProps<"/professional/profile">;

export default async function ProfessionalProfilePage({
  searchParams,
}: ProfessionalProfilePageProps) {
  const user = await requireProfessional();
  const profile = await getMyProfessionalProfileView(user.id);
  const params = await searchParams;
  const showSavedBanner = params.saved === "1";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>הפרופיל שלי</h1>
        <p className={styles.description}>
          עדכנו את פרטי הקשר והמידע המקצועי שיוצגו בפרויקטים עתידיים.
        </p>
      </header>

      <ProfessionalProfileForm
        initialProfile={toProfileFormInput(profile)}
        showSavedBanner={showSavedBanner}
      />
    </div>
  );
}
