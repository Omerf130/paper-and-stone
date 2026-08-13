import type { Metadata } from "next";
import { requireProfessional } from "@/lib/auth/authorization";
import { getMyProfessionalProfileView } from "@/lib/professionals/ensureProfessionalProfile";
import { toProfileFormInput } from "@/lib/professionals/profile-completeness";
import InternalPage from "@/components/internal/InternalPage/InternalPage";
import InternalPageHeader from "@/components/internal/InternalPageHeader/InternalPageHeader";
import ProfessionalProfileForm from "@/components/professional/ProfessionalProfileForm/ProfessionalProfileForm";

export const metadata: Metadata = {
  title: "הפרופיל שלי | Paper & Stone",
};

export default async function ProfessionalProfilePage() {
  const user = await requireProfessional();
  const profile = await getMyProfessionalProfileView(user.id);

  return (
    <InternalPage width="form">
      <InternalPageHeader
        title="הפרופיל שלי"
        description="עדכנו את פרטי הקשר והמידע המקצועי שיוצגו בפרויקטים."
      />

      <ProfessionalProfileForm initialProfile={toProfileFormInput(profile)} />
    </InternalPage>
  );
}
