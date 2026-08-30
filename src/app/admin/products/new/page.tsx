import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm/ProductForm";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";
import { getActiveCategories } from "@/lib/products/getActiveCategories";
import { getActiveMaterialsWithColors } from "@/lib/products/material-options/getActiveMaterialsWithColors";
import { getSupplierFormOptions } from "@/lib/suppliers/getAdminSuppliers";
import { EMPTY_PRODUCT_FORM } from "@/types/admin-product";

export const metadata: Metadata = {
  title: "מוצר חדש | Paper & Stone",
};

export default async function AdminNewProductPage() {
  const [categories, activeMaterials, supplierOptions] = await Promise.all([
    getActiveCategories(),
    getActiveMaterialsWithColors(),
    getSupplierFormOptions(),
  ]);

  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="יצירת מוצר"
        description="לאחר שמירת המוצר ניתן להוסיף תמונות ולהגדיר צביעה אוטומטית."
        actions={
          <Button href="/admin/products" variant="ghost" size="sm">
            חזרה למוצרים
          </Button>
        }
      />

      <ProductForm
        mode="create"
        categories={categories}
        supplierOptions={supplierOptions}
        initialProduct={EMPTY_PRODUCT_FORM}
        activeMaterials={activeMaterials}
      />
    </AdminPage>
  );
}
