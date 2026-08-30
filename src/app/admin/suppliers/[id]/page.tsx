import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SupplierForm from "@/components/admin/SupplierForm/SupplierForm";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";
import { getAdminSupplierById } from "@/lib/suppliers/getAdminSupplierById";

type AdminEditSupplierPageProps = PageProps<"/admin/suppliers/[id]">;

export async function generateMetadata({
  params,
}: AdminEditSupplierPageProps): Promise<Metadata> {
  const { id } = await params;
  const supplier = await getAdminSupplierById(id);

  return {
    title: supplier
      ? `עריכת ${supplier.name} | Paper & Stone`
      : "עריכת ספק | Paper & Stone",
  };
}

export default async function AdminEditSupplierPage({
  params,
}: AdminEditSupplierPageProps) {
  const { id } = await params;
  const supplier = await getAdminSupplierById(id);

  if (!supplier) {
    notFound();
  }

  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="עריכת ספק"
        description={supplier.name}
        actions={
          <Button href="/admin/suppliers" variant="ghost" size="sm">
            חזרה לספקים
          </Button>
        }
      />

      <SupplierForm mode="edit" initialSupplier={supplier} supplierId={id} />
    </AdminPage>
  );
}
