import type { Metadata } from "next";
import { requireClient } from "@/lib/auth/authorization";
import {
  buildClientProjectsHref,
  parseClientProjectsParams,
} from "@/lib/client-projects/client-project-params";
import { getClientProjectsPage } from "@/lib/client-projects/getClientProjectsPage";
import InternalPage from "@/components/internal/InternalPage/InternalPage";
import InternalPageHeader from "@/components/internal/InternalPageHeader/InternalPageHeader";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import AdminPagination from "@/components/admin/list/AdminPagination";
import ClientProjectCard from "@/components/client/ClientProjectCard/ClientProjectCard";
import ClientProjectsSearch from "@/components/client/ClientProjectsSearch/ClientProjectsSearch";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "הפרויקטים שלי | Paper & Stone",
};

export default async function ClientProjectsPage({
  searchParams,
}: PageProps<"/client/projects">) {
  const user = await requireClient();
  const params = parseClientProjectsParams(await searchParams);
  const result = await getClientProjectsPage(user.id, params);

  return (
    <InternalPage width="default">
      <InternalPageHeader
        title="הפרויקטים שלי"
        description="כל הפרויקטים שמשויכים לחשבון שלכם."
      />

      <ClientProjectsSearch initialQuery={params.query ?? ""} />

      {result.projects.length === 0 ? (
        <EmptyState
          title={
            params.query
              ? "לא נמצאו פרויקטים התואמים לחיפוש."
              : "עדיין אין פרויקטים שמשויכים לחשבון שלך."
          }
          description={
            params.query
              ? "נסו לחפש לפי שם פרויקט אחר."
              : "כאשר ישויך אליכם פרויקט, הוא יופיע כאן."
          }
        />
      ) : (
        <>
          <ul className={styles.projectList}>
            {result.projects.map((project) => (
              <li key={project.projectId}>
                <ClientProjectCard project={project} />
              </li>
            ))}
          </ul>

          <AdminPagination
            page={result.page}
            totalPages={result.totalPages}
            hrefForPage={(pageNumber) =>
              buildClientProjectsHref({
                query: params.query,
                page: pageNumber,
              })
            }
            ariaLabel="עמודי פרויקטים"
          />
        </>
      )}
    </InternalPage>
  );
}
