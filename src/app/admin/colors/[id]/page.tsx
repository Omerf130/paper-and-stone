import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ColorForm from "@/components/admin/ColorForm/ColorForm";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";
import { getAdminColorById } from "@/lib/colors/getAdminColorById";

type AdminEditColorPageProps = PageProps<"/admin/colors/[id]">;

export async function generateMetadata({
  params,
}: AdminEditColorPageProps): Promise<Metadata> {
  const { id } = await params;
  const color = await getAdminColorById(id);

  return {
    title: color
      ? `עריכת ${color.nameHe} | Paper & Stone`
      : "עריכת צבע | Paper & Stone",
  };
}

export default async function AdminEditColorPage({
  params,
}: AdminEditColorPageProps) {
  const { id } = await params;
  const color = await getAdminColorById(id);

  if (!color) {
    notFound();
  }

  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="עריכת צבע"
        description={color.nameHe}
        actions={
          <Button href="/admin/colors" variant="ghost" size="sm">
            חזרה לצבעים
          </Button>
        }
      />

      <ColorForm mode="edit" initialColor={color} colorId={id} />
    </AdminPage>
  );
}
