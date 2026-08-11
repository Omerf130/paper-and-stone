import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MaterialForm from "@/components/admin/MaterialForm/MaterialForm";
import {
  getActiveColorsForPicker,
  getColorsByIds,
} from "@/lib/materials/getActiveColorsForPicker";
import { getAdminMaterialById } from "@/lib/materials/getAdminMaterialById";
import styles from "../../products/new/page.module.scss";

type AdminEditMaterialPageProps = PageProps<"/admin/materials/[id]">;

export async function generateMetadata({
  params,
}: AdminEditMaterialPageProps): Promise<Metadata> {
  const { id } = await params;
  const material = await getAdminMaterialById(id);

  return {
    title: material
      ? `עריכת ${material.nameHe} | Paper & Stone`
      : "עריכת חומר | Paper & Stone",
  };
}

export default async function AdminEditMaterialPage({
  params,
  searchParams,
}: AdminEditMaterialPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const material = await getAdminMaterialById(id);

  if (!material) {
    notFound();
  }

  const [activeColors, linkedColorDetails] = await Promise.all([
    getActiveColorsForPicker(),
    getColorsByIds(material.colorIds),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>עריכת חומר</h1>
        <p className={styles.description}>{material.nameHe}</p>
      </header>

      <MaterialForm
        mode="edit"
        initialMaterial={material}
        activeColors={activeColors}
        linkedColorDetails={linkedColorDetails}
        materialId={id}
        showSavedBanner={resolvedSearchParams.saved === "1"}
      />
    </div>
  );
}
