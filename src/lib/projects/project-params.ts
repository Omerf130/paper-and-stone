import type { ProjectStatus } from "@/types/project";

export const PROJECTS_PAGE_SIZE = 20;

export type AdminProjectsQueue =
  | "all"
  | "attention"
  | "active"
  | "commercial"
  | "onboarding";

export type AdminProjectsStatusFilter = ProjectStatus;

export type AdminProjectsParams = {
  query: string | null;
  queue: AdminProjectsQueue;
  status: AdminProjectsStatusFilter;
  page: number;
};

export type AdminProjectsHrefInput = {
  query?: string | null;
  queue?: AdminProjectsQueue;
  status?: AdminProjectsStatusFilter;
  page?: number;
};

const PROJECT_STATUSES: ProjectStatus[] = [
  "draft",
  "submitted",
  "changes_requested",
  "approved",
  "rejected",
];

const PROJECT_QUEUES: AdminProjectsQueue[] = [
  "all",
  "attention",
  "active",
  "commercial",
  "onboarding",
];

function parsePageValue(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (!value) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function parseStringParam(
  raw: string | string[] | undefined,
): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function parseStatusParam(
  raw: string | string[] | undefined,
): AdminProjectsStatusFilter {
  const value = parseStringParam(raw);

  if (!value || !PROJECT_STATUSES.includes(value as ProjectStatus)) {
    return "submitted";
  }

  return value as ProjectStatus;
}

function parseQueueParam(
  raw: string | string[] | undefined,
): AdminProjectsQueue {
  const value = parseStringParam(raw);

  if (!value || !PROJECT_QUEUES.includes(value as AdminProjectsQueue)) {
    return "attention";
  }

  return value as AdminProjectsQueue;
}

export function parseAdminProjectsParams(
  raw: Record<string, string | string[] | undefined>,
): AdminProjectsParams {
  return {
    query: parseStringParam(raw.q),
    queue: parseQueueParam(raw.queue),
    status: parseStatusParam(raw.status),
    page: parsePageValue(raw.page),
  };
}

export function buildAdminProjectsHref(input: AdminProjectsHrefInput = {}): string {
  const params = new URLSearchParams();

  const query = input.query?.trim();
  if (query) {
    params.set("q", query);
  }

  if (input.queue && input.queue !== "attention") {
    params.set("queue", input.queue);
  }

  if (input.status && input.status !== "submitted") {
    params.set("status", input.status);
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  const search = params.toString();
  return search ? `/admin/projects?${search}` : "/admin/projects";
}

export const ADMIN_PROJECTS_QUEUE_LABELS: Record<AdminProjectsQueue, string> = {
  all: "כל הפרויקטים",
  attention: "דורש טיפול",
  active: "פעילים",
  commercial: "ממתינים לבדיקה",
  onboarding: "ממתינים לאישור פתיחה",
};
