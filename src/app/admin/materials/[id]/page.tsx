import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MaterialForm from "@/components/admin/MaterialForm/MaterialForm";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";
import {
  getActiveColorsForPicker,
  getColorsByIds,
} from "@/lib/materials/getActiveColorsForPicker";
import { getAdminMaterialById } from "@/lib/materials/getAdminMaterialById";

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
}: AdminEditMaterialPageProps) {
  const { id } = await params;
  const material = await getAdminMaterialById(id);

  if (!material) {
    notFound();
  }

  const [activeColors, linkedColorDetails] = await Promise.all([
    getActiveColorsForPicker(),
    getColorsByIds(material.colorIds),
  ]);

  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="עריכת חומר"
        description={material.nameHe}
        actions={
          <Button href="/admin/materials" variant="ghost" size="sm">
            חזרה לחומרים
          </Button>
        }
      />

      <MaterialForm
        mode="edit"
        initialMaterial={material}
        activeColors={activeColors}
        linkedColorDetails={linkedColorDetails}
        materialId={id}
      />
    </AdminPage>
  );
}
