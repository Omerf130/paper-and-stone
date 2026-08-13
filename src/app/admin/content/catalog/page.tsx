import Button from "@/components/ui/Button/Button";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import CatalogPageContentForm from "@/components/admin/CatalogPageContentForm/CatalogPageContentForm";
import { catalogDocumentExists } from "@/lib/cms/catalog-page-content-mutations";
import { getCatalogPageContent } from "@/lib/cms/get-cms-content";

export default async function AdminCatalogPageContentPage() {
  const [initialContent, documentExists] = await Promise.all([
    getCatalogPageContent(),
    catalogDocumentExists(),
  ]);

  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="עמוד המוצרים"
        description="ניהול התוכן השיווקי המוצג בראש קטלוג המוצרים"
        actions={
          <>
            <Button href="/products" variant="secondary" size="sm">
              צפייה בעמוד המוצרים
            </Button>
            <Button href="/admin/content" variant="ghost" size="sm">
              חזרה לתוכן
            </Button>
          </>
        }
      />
      <CatalogPageContentForm
        initialContent={initialContent}
        documentExists={documentExists}
      />
    </AdminPage>
  );
}
