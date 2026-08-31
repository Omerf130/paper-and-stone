import AdminProjectLogisticsTab from "@/components/admin/project-detail/AdminProjectLogisticsTab/AdminProjectLogisticsTab";
import type { AdminProjectDetailWithThumbnails } from "@/lib/projects/getAdminProjects";

type AdminProjectImportTabProps = {
  project: AdminProjectDetailWithThumbnails;
};

export default function AdminProjectImportTab({
  project,
}: AdminProjectImportTabProps) {
  return <AdminProjectLogisticsTab project={project} />;
}
