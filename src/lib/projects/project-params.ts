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
  clientId: string | null;
  architectId: string | null;
  page: number;
};

export type AdminProjectsHrefInput = {
  query?: string | null;
  queue?: AdminProjectsQueue;
  status?: AdminProjectsStatusFilter;
  clientId?: string | null;
  architectId?: string | null;
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

function parseObjectIdParam(
  raw: string | string[] | undefined,
): string | null {
  const value = parseStringParam(raw);

  if (!value || !/^[a-f\d]{24}$/i.test(value)) {
    return null;
  }

  return value;
}

export function parseAdminProjectsParams(
  raw: Record<string, string | string[] | undefined>,
): AdminProjectsParams {
  return {
    query: parseStringParam(raw.q),
    queue: parseQueueParam(raw.queue),
    status: parseStatusParam(raw.status),
    clientId: parseObjectIdParam(raw.clientId),
    architectId: parseObjectIdParam(raw.architectId),
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

  if (input.clientId) {
    params.set("clientId", input.clientId);
  }

  if (input.architectId) {
    params.set("architectId", input.architectId);
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  const search = params.toString();
  return search ? `/admin/projects?${search}` : "/admin/projects";
}

export function hasAdminProjectsFilters(
  params: AdminProjectsParams,
): boolean {
  return Boolean(
    params.query ||
      params.clientId ||
      params.architectId ||
      (params.queue === "commercial" && params.status !== "submitted") ||
      params.queue !== "attention",
  );
}

export const ADMIN_PROJECTS_QUEUE_LABELS: Record<AdminProjectsQueue, string> = {
  all: "כל הפרויקטים",
  attention: "דורש טיפול",
  active: "פעילים",
  commercial: "ממתינים לבדיקה",
  onboarding: "ממתינים לאישור פתיחה",
};
