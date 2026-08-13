import Button from "@/components/ui/Button/Button";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm/SiteSettingsForm";
import { getSiteSettings } from "@/lib/cms/get-cms-content";

export default async function AdminSiteSettingsPage() {
  const siteSettings = await getSiteSettings();

  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="הגדרות אתר"
        description="מיתוג, פרטי קשר, פוטר ו-SEO בסיסי"
        actions={
          <Button href="/admin/content" variant="ghost" size="sm">
            חזרה לתוכן
          </Button>
        }
      />
      <SiteSettingsForm initialSettings={siteSettings} />
    </AdminPage>
  );
}
