import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm/ProductForm";
import ProductMediaManager from "@/components/admin/ProductMediaManager/ProductMediaManager";
import ProductRecolorManager from "@/components/admin/ProductRecolorManager/ProductRecolorManager";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";
import { getProductFormCategoryOptions } from "@/lib/categories/getProductFormCategoryOptions";
import { getAdminProductMediaById } from "@/lib/media/getAdminProductMediaById";
import { getAdminProductById } from "@/lib/products/getAdminProductById";
import { getProductMaterialOptionsForAdmin } from "@/lib/products/material-options/getProductMaterialOptionsForAdmin";

type AdminEditProductPageProps = PageProps<"/admin/products/[id]">;

export async function generateMetadata({
  params,
}: AdminEditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdminProductById(id);

  return {
    title: product
      ? `עריכת ${product.nameHe} | Paper & Stone`
      : "עריכת מוצר | Paper & Stone",
  };
}

export default async function AdminEditProductPage({
  params,
  searchParams,
}: AdminEditProductPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const product = await getAdminProductById(id);

  if (!product) {
    notFound();
  }

  const [categories, media, materialOptionsData] = await Promise.all([
    getProductFormCategoryOptions(product.categoryId),
    getAdminProductMediaById(id),
    getProductMaterialOptionsForAdmin(product.materialOptions),
  ]);

  const previewColors = materialOptionsData.assignedMaterials.flatMap(
    (material) => material.colors,
  ).filter(
    (color, index, colors) =>
      colors.findIndex((candidate) => candidate.id === color.id) === index,
  );

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title="עריכת מוצר"
        description={product.nameHe}
        actions={
          <Button href="/admin/products" variant="ghost" size="sm">
            חזרה למוצרים
          </Button>
        }
      />

      <ProductForm
        mode="edit"
        categories={categories}
        initialProduct={product}
        productId={id}
        showSavedBanner={resolvedSearchParams.saved === "1"}
        activeMaterials={materialOptionsData.activeMaterials}
        assignedMaterials={materialOptionsData.assignedMaterials}
      />

      {media ? <ProductMediaManager media={media} /> : null}
      {media ? (
        <ProductRecolorManager
          media={media}
          previewColors={previewColors.map((color) => ({
            id: color.id,
            name: color.nameHe,
            hex: color.hex,
          }))}
        />
      ) : null}
    </AdminPage>
  );
}
