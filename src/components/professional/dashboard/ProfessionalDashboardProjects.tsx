import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import Button from "@/components/ui/Button/Button";
import type { ProfessionalDashboardProject } from "@/types/professional-dashboard";
import ProfessionalProjectRow from "@/components/professional/projects/ProfessionalProjectRow/ProfessionalProjectRow";
import styles from "./ProfessionalDashboardProjects.module.scss";

type ProfessionalDashboardProjectsProps = {
  projects: ProfessionalDashboardProject[];
};

export default function ProfessionalDashboardProjects({
  projects,
}: ProfessionalDashboardProjectsProps) {
  return (
    <section className={styles.section} aria-labelledby="pro-projects-title">
      <div className={styles.header}>
        <h2 id="pro-projects-title" className={styles.title}>
          הפרויקטים שלי
        </h2>
        {projects.length > 0 ? (
          <Link href="/professional/projects" className={styles.footerLink}>
            כל הפרויקטים
          </Link>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="עדיין לא יצרת פרויקטים"
          description="צרו פרויקט חדש כדי להתחיל לבחור מוצרים עבור לקוח."
          action={
            <Button href="/professional/projects/new">יצירת פרויקט חדש</Button>
          }
        />
      ) : (
        <ul className={styles.list}>
          {projects.map((project) => (
            <li key={project.id}>
              <ProfessionalProjectRow project={project} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
