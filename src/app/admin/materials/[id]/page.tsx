import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MaterialForm from "@/components/admin/MaterialForm/MaterialForm";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";
import { getAdminMaterialById } from "@/lib/materials/getAdminMaterialById";
import { getMaterialTypeOptions } from "@/lib/materials/getMaterialTypeOptions";
import { getProductsUsingMaterial } from "@/lib/materials/material-product-links";

type AdminEditMaterialPageProps = PageProps<"/admin/materials/[id]">;

export async function generateMetadata({
  params,
}: AdminEditMaterialPageProps): Promise<Metadata> {
  const { id } = await params;
  const material = await getAdminMaterialById(id);

  return {
    title: material
      ? `עריכת ${material.nameEn} | Paper & Stone`
      : "עריכת חומר | Paper & Stone",
  };
}

export default async function AdminEditMaterialPage({
  params,
}: AdminEditMaterialPageProps) {
  const { id } = await params;
  const material = await getAdminMaterialById(id);

  if (!material) {
    notFound();
  }

  const [materialTypeOptions, productLinks] = await Promise.all([
    getMaterialTypeOptions(),
    getProductsUsingMaterial(id),
  ]);

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="עריכת חומר"
        description={material.nameEn}
        actions={
          <Button href="/admin/materials" variant="ghost" size="sm">
            חזרה לחומרים
          </Button>
        }
      />

      <MaterialForm
        mode="edit"
        initialMaterial={material}
        materialTypeOptions={materialTypeOptions}
        materialId={id}
        initialProductLinks={productLinks}
      />
    </AdminPage>
  );
}
