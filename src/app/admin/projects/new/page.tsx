import type { Metadata } from "next";
import { getArchitectLookupAction } from "@/app/admin/architects/actions";
import AdminCreateProjectForm from "@/components/admin/crm/AdminCreateProjectForm/AdminCreateProjectForm";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import Button from "@/components/ui/Button/Button";
import { findClientByIdForAdmin } from "@/lib/admin/clients/client-lookup-queries";

export const metadata: Metadata = {
  title: "פרויקט חדש | Paper & Stone",
};

type AdminNewProjectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseIdParam(
  raw: string | string[] | undefined,
): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() || undefined;
}

export default async function AdminNewProjectPage({
  searchParams,
}: AdminNewProjectPageProps) {
  const resolvedSearchParams = await searchParams;
  const clientId = parseIdParam(resolvedSearchParams.clientId);
  const architectId = parseIdParam(resolvedSearchParams.architectId);

  const [client, architectResult] = await Promise.all([
    clientId ? findClientByIdForAdmin(clientId) : Promise.resolve(null),
    architectId
      ? getArchitectLookupAction(architectId)
      : Promise.resolve({ architect: null }),
  ]);

  return (
    <AdminPage width="form">
      <AdminPageHeader
        title="יצירת פרויקט"
        description="יצירת פרויקט חדש עם שיוך אדריכל ולקוח"
        actions={
          <Button href="/admin/projects" variant="ghost" size="sm">
            חזרה לפרויקטים
          </Button>
        }
      />

      <AdminCreateProjectForm
        initialArchitectId={architectId}
        initialClientId={clientId}
        preselectedArchitect={architectResult.architect}
        preselectedClient={client}
      />
    </AdminPage>
  );
}
