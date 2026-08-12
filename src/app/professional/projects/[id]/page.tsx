import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfessional } from "@/lib/auth/authorization";
import {
  getOwnedProjectDetailView,
  loadProductViewsByIds,
} from "@/lib/projects/project-queries";
import { getProjectStatusLabel } from "@/lib/projects/project-display-helpers";
import ProjectForm from "@/components/professional/projects/ProjectForm/ProjectForm";
import ProjectItemsList from "@/components/professional/projects/ProjectItemsList/ProjectItemsList";
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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{project.name}</h1>
          <p className={styles.status}>{getProjectStatusLabel(project.status)}</p>
        </div>
        <Link href="/products" className={styles.addProductsLink}>
          הוספת מוצרים
        </Link>
      </header>

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
          showDelete={project.status === "draft"}
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
        />
      </section>
    </div>
  );
}
