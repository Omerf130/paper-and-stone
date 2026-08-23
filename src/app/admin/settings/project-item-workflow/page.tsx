import type { Metadata } from "next";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import ProjectItemWorkflowSettingsForm from "@/components/admin/ProjectItemWorkflowSettingsForm/ProjectItemWorkflowSettingsForm";
import { getProjectItemWorkflowSettings } from "@/lib/project-items/get-project-item-workflow-settings";
import ProjectItemWorkflowSettings from "@/models/ProjectItemWorkflowSettings";
import { connectDB } from "@/lib/db/mongoose";
import { PROJECT_ITEM_WORKFLOW_SETTINGS_KEY } from "@/lib/project-items/project-item-workflow-defaults";

export const metadata: Metadata = {
  title: "תהליך סטטוס מוצר | Paper & Stone",
};

async function workflowSettingsDocumentExists(): Promise<boolean> {
  await connectDB();
  const document = await ProjectItemWorkflowSettings.findOne({
    key: PROJECT_ITEM_WORKFLOW_SETTINGS_KEY,
  })
    .select("_id")
    .lean();

  return Boolean(document);
}

export default async function ProjectItemWorkflowSettingsPage() {
  const [settings, documentExists] = await Promise.all([
    getProjectItemWorkflowSettings(),
    workflowSettingsDocumentExists(),
  ]);

  return (
    <AdminPage width="default">
      <AdminPageHeader
        title="תהליך סטטוס מוצר"
        description="הגדרת מעברי סטטוס מותרים לאדריכל וללקוח. מנהל המערכת יכול לעקוף בכל עת."
      />
      <ProjectItemWorkflowSettingsForm
        initialSettings={settings}
        documentExists={documentExists}
      />
    </AdminPage>
  );
}
