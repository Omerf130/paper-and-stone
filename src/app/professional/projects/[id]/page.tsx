import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfessional } from "@/lib/auth/authorization";
import {
  isProjectReadOnly,
} from "@/lib/projects/assertProjectEditable";
import { hasEverBeenSubmitted } from "@/lib/projects/project-review-history";
import {
  getOwnedProjectDetailView,
  loadProductViewsByIds,
} from "@/lib/projects/project-queries";
import ProjectForm from "@/components/professional/projects/ProjectForm/ProjectForm";
import ProjectItemsList from "@/components/professional/projects/ProjectItemsList/ProjectItemsList";
import ProjectReviewHistory from "@/components/professional/projects/ProjectReviewHistory/ProjectReviewHistory";
import ProjectStatusBanner from "@/components/professional/projects/ProjectStatusBanner/ProjectStatusBanner";
import ProjectSubmitButton from "@/components/professional/projects/ProjectSubmitButton/ProjectSubmitButton";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "פרויקט | Paper & Stone",
};

type ProjectDetailPageProps = PageProps<"/professional/projects/[id]">;

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const user = await requireProfessional();
  const { id } = await params;
  const project = await getOwnedProjectDetailView(user.id, id);

  if (!project) {
    notFound();
  }

  const productIds = [...new Set(project.items.map((item) => item.productId))];
  const productViewsById = await loadProductViewsByIds(productIds);
  const readOnly = isProjectReadOnly(project.status);
  const showDelete =
    project.status === "draft" &&
    !hasEverBeenSubmitted({
      reviewHistory: project.reviewHistory.map((entry) => ({
        action: entry.action,
      })),
    });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{project.name}</h1>
        </div>
        {!readOnly ? (
          <Link href="/products" className={styles.addProductsLink}>
            הוספת מוצרים
          </Link>
        ) : null}
      </header>

      <ProjectStatusBanner
        status={project.status}
        reviewHistory={project.reviewHistory}
        submittedAt={project.submittedAt}
      />

      <ProjectSubmitButton
        projectId={project.id}
        status={project.status}
        itemCount={project.items.length}
      />

      <section className={styles.section} aria-labelledby="project-details-title">
        <h2 id="project-details-title" className={styles.sectionTitle}>
          פרטי פרויקט
        </h2>
        <ProjectForm
          mode="edit"
          projectId={project.id}
          initialProject={{
            name: project.name,
            clientName: project.clientName ?? "",
            location: project.location ?? "",
            description: project.description ?? "",
          }}
          showDelete={showDelete}
          readOnly={readOnly}
        />
      </section>

      <section className={styles.section} aria-labelledby="project-items-title">
        <h2 id="project-items-title" className={styles.sectionTitle}>
          מוצרים בפרויקט
        </h2>
        <ProjectItemsList
          projectId={project.id}
          items={project.items}
          productViewsById={productViewsById}
          readOnly={readOnly}
        />
      </section>

      {project.reviewHistory.length > 0 ? (
        <ProjectReviewHistory history={project.reviewHistory} />
      ) : null}
    </div>
  );
}
