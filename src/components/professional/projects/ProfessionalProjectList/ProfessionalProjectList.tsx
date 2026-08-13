import EmptyState from "@/components/ui/EmptyState/EmptyState";
import Button from "@/components/ui/Button/Button";
import type { ProjectListItemView } from "@/types/project";
import ProfessionalProjectRow from "@/components/professional/projects/ProfessionalProjectRow/ProfessionalProjectRow";
import styles from "./ProfessionalProjectList.module.scss";

type ProfessionalProjectListProps = {
  projects: ProjectListItemView[];
};

export default function ProfessionalProjectList({
  projects,
}: ProfessionalProjectListProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="עדיין לא יצרת פרויקטים"
        description="צרו פרויקט חדש כדי להתחיל לבחור מוצרים עבור לקוח."
        action={
          <Button href="/professional/projects/new">יצירת פרויקט חדש</Button>
        }
      />
    );
  }

  return (
    <ul className={styles.list}>
      {projects.map((project) => (
        <li key={project.id}>
          <ProfessionalProjectRow project={project} />
        </li>
      ))}
    </ul>
  );
}
