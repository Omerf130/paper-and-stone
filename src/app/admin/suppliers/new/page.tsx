import type { Metadata } from "next";
import SupplierForm from "@/components/admin/SupplierForm/SupplierForm";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";
import { EMPTY_SUPPLIER_FORM } from "@/types/admin-supplier";

export const metadata: Metadata = {
  title: "ספק חדש | Paper & Stone",
};

export default function AdminNewSupplierPage() {
  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="יצירת ספק"
        description="הגדירו ספק חדש לשיוך מוצרים."
        actions={
          <Button href="/admin/suppliers" variant="ghost" size="sm">
            חזרה לספקים
          </Button>
        }
      />

      <SupplierForm mode="create" initialSupplier={EMPTY_SUPPLIER_FORM} />
    </AdminPage>
  );
}
