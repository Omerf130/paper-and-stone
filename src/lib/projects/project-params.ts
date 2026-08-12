import type { ProjectStatus } from "@/types/project";

export const PROJECTS_PAGE_SIZE = 20;

export type AdminProjectsStatusFilter = ProjectStatus;

export type AdminProjectsParams = {
  query: string | null;
  status: AdminProjectsStatusFilter;
  page: number;
};

export type AdminProjectsHrefInput = {
  query?: string | null;
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

export function parseAdminProjectsParams(
  raw: Record<string, string | string[] | undefined>,
): AdminProjectsParams {
  return {
    query: parseStringParam(raw.q),
    status: parseStatusParam(raw.status),
    page: parsePageValue(raw.page),
  };
}

export function buildAdminProjectsHref(
  input: AdminProjectsHrefInput = {},
): string {
  const params = new URLSearchParams();

  const query = input.query?.trim();
  if (query) {
    params.set("q", query);
  }

  const status = input.status ?? "submitted";
  if (status !== "submitted") {
    params.set("status", status);
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  const search = params.toString();
  return search ? `/admin/projects?${search}` : "/admin/projects";
}
