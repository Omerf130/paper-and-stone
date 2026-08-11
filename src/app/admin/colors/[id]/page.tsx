import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ColorForm from "@/components/admin/ColorForm/ColorForm";
import { getAdminColorById } from "@/lib/colors/getAdminColorById";
import styles from "../../products/new/page.module.scss";

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
  searchParams,
}: AdminEditColorPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const color = await getAdminColorById(id);

  if (!color) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>עריכת צבע</h1>
        <p className={styles.description}>{color.nameHe}</p>
      </header>

      <ColorForm
        mode="edit"
        initialColor={color}
        colorId={id}
        showSavedBanner={resolvedSearchParams.saved === "1"}
      />
    </div>
  );
}
