import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { getPendingArchitectRequests } from "@/lib/users/architect-request-queries";
import { getPendingClientRequests } from "@/lib/users/client-request-queries";
import type { AdminDashboardActivityEntry } from "@/types/admin-dashboard";

const MAX_ENTRIES = 5;

type ActivitySource = AdminDashboardActivityEntry & {
  sortAt: number;
};

function pushEntry(
  entries: ActivitySource[],
  entry: Omit<ActivitySource, "sortAt"> & { sortAt: string | Date },
): void {
  const sortAt =
    entry.sortAt instanceof Date
      ? entry.sortAt.getTime()
      : new Date(entry.sortAt).getTime();

  if (Number.isNaN(sortAt)) {
    return;
  }

  entries.push({ ...entry, sortAt });
}

export async function buildAdminDashboardActivityFeed(): Promise<
  AdminDashboardActivityEntry[]
> {
  await connectDB();

  const [recentProjects, submittedProjects, clientRequests, architectRequests] =
    await Promise.all([
      Project.find({})
        .sort({ updatedAt: -1 })
        .limit(3)
        .select("name updatedAt location")
        .lean(),
      Project.find({ status: "submitted", submittedAt: { $exists: true } })
        .sort({ submittedAt: -1 })
        .limit(2)
        .select("name submittedAt")
        .lean(),
      getPendingClientRequests(),
      getPendingArchitectRequests(),
    ]);

  const entries: ActivitySource[] = [];

  for (const project of recentProjects) {
    pushEntry(entries, {
      id: `project-updated-${project._id.toString()}`,
      kind: "project_updated",
      primary: `פרויקט ${project.name} עודכן`,
      secondary: project.location?.trim() || "פרויקט",
      timestamp: project.updatedAt.toISOString(),
      href: `/admin/projects/${project._id.toString()}`,
      sortAt: project.updatedAt,
    });
  }

  for (const project of submittedProjects) {
    if (!project.submittedAt) {
      continue;
    }

    pushEntry(entries, {
      id: `project-submitted-${project._id.toString()}`,
      kind: "project_submitted",
      primary: `פרויקט ${project.name} הוגש לבדיקה`,
      secondary: "בדיקה מסחרית",
      timestamp: project.submittedAt.toISOString(),
      href: `/admin/projects/${project._id.toString()}`,
      sortAt: project.submittedAt,
    });
  }

  for (const request of clientRequests.slice(0, 2)) {
    pushEntry(entries, {
      id: `client-request-${request.id}`,
      kind: "client_request",
      primary: `בקשת לקוח חדשה — ${request.fullName || request.email}`,
      secondary: "CRM · בקשות לקוח",
      timestamp: request.createdAt,
      href: "/admin/client-requests",
      sortAt: request.createdAt,
    });
  }

  for (const request of architectRequests.slice(0, 2)) {
    pushEntry(entries, {
      id: `architect-request-${request.id}`,
      kind: "architect_request",
      primary: `בקשת אדריכל חדשה — ${request.fullName || request.email}`,
      secondary: "CRM · בקשות אדריכל",
      timestamp: request.createdAt,
      href: "/admin/architect-requests",
      sortAt: request.createdAt,
    });
  }

  return entries
    .sort((left, right) => right.sortAt - left.sortAt)
    .slice(0, MAX_ENTRIES)
    .map(({ sortAt: _sortAt, ...entry }) => entry);
}
