import Button from "@/components/ui/Button/Button";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import HomepageContentEditor from "@/components/admin/homepage/HomepageContentEditor";
import { getAdminHomepageContent } from "@/lib/cms/get-admin-homepage-content";
import { connectDB } from "@/lib/db/mongoose";
import HomepageContent from "@/models/HomepageContent";
import { CMS_SINGLETON_KEYS } from "@/types/cms-content";

async function getPersistedHomepageItemIds(): Promise<string[]> {
  await connectDB();

  const document = await HomepageContent.findOne({ key: CMS_SINGLETON_KEYS.homepage })
    .select("categories.items.id inspiration.items.id professionals.steps.id")
    .lean();

  if (!document) {
    return [];
  }

  const ids = [
    ...(document.categories?.items ?? []).map((item) => item.id),
    ...(document.inspiration?.items ?? []).map((item) => item.id),
    ...(document.professionals?.steps ?? []).map((step) => step.id),
  ];

  return ids.filter(Boolean);
}

export default async function AdminHomepageContentPage() {
  const [payload, persistedItemIds] = await Promise.all([
    getAdminHomepageContent(),
    getPersistedHomepageItemIds(),
  ]);

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="דף הבית"
        description="ניהול התוכן והתמונות המוצגים בדף הבית"
        actions={
          <>
            <Button href="/" variant="secondary" size="sm">
              צפייה בדף הבית
            </Button>
            <Button href="/admin/content" variant="ghost" size="sm">
              חזרה לתוכן
            </Button>
          </>
        }
      />
      <HomepageContentEditor
        {...payload}
        persistedItemIds={persistedItemIds}
      />
    </AdminPage>
  );
}
