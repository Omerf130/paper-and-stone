import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminDetailSection from "@/components/admin/project-detail/AdminDetailSection/AdminDetailSection";
import AdminProductSectionNav from "@/components/admin/product-edit/AdminProductSectionNav";
import ProductForm from "@/components/admin/ProductForm/ProductForm";
import ProductMediaManager from "@/components/admin/ProductMediaManager/ProductMediaManager";
import ProductRecolorManager from "@/components/admin/ProductRecolorManager/ProductRecolorManager";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { mapEntityActiveToBadge } from "@/lib/ui/map-status-badge";
import { getProductFormCategoryOptions } from "@/lib/categories/getProductFormCategoryOptions";
import { getAdminProductMediaById } from "@/lib/media/getAdminProductMediaById";
import { getAdminProductById } from "@/lib/products/getAdminProductById";
import { getProductMaterialOptionsForAdmin } from "@/lib/products/material-options/getProductMaterialOptionsForAdmin";
import styles from "./page.module.scss";

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

  const categoryName =
    categories.find((category) => category.id === product.categoryId)?.nameHe ??
    undefined;

  const previewColors = materialOptionsData.assignedMaterials
    .flatMap((material) => material.colors)
    .filter(
      (color, index, colors) =>
        colors.findIndex((candidate) => candidate.id === color.id) === index,
    );

  const activeStatus = mapEntityActiveToBadge(product.isActive);

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        title={product.nameHe}
        description={
          [product.nameEn, product.sku ? `SKU: ${product.sku}` : null, categoryName]
            .filter(Boolean)
            .join(" · ") || undefined
        }
        actions={
          <Button href="/admin/products" variant="ghost" size="sm">
            חזרה למוצרים
          </Button>
        }
      >
        <div className={styles.metaStrip}>
          <StatusBadge tone={activeStatus.tone}>{activeStatus.label}</StatusBadge>
          {product.isFeatured ? (
            <StatusBadge tone="positive">מומלץ</StatusBadge>
          ) : null}
        </div>
      </AdminPageHeader>

      <AdminProductSectionNav />

      <ProductForm
        mode="edit"
        categories={categories}
        initialProduct={product}
        productId={id}
        showSavedBanner={resolvedSearchParams.saved === "1"}
        activeMaterials={materialOptionsData.activeMaterials}
        assignedMaterials={materialOptionsData.assignedMaterials}
      >
        {media ? (
          <AdminDetailSection id="product-media" title="מדיה">
            <ProductMediaManager media={media} hideTitle />
          </AdminDetailSection>
        ) : null}
        {media ? (
          <AdminDetailSection id="product-recolor" title="צביעה אוטומטית">
            <ProductRecolorManager
              media={media}
              hideTitle
              previewColors={previewColors.map((color) => ({
                id: color.id,
                name: color.nameHe,
                hex: color.hex,
              }))}
            />
          </AdminDetailSection>
        ) : null}
      </ProductForm>
    </AdminPage>
  );
}
