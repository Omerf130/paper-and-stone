export const CLIENT_PROJECTS_PAGE_SIZE = 20;

export const CLIENT_DASHBOARD_PROJECT_LIMIT = 5;

export type ClientProjectsParams = {
  query: string | null;
  page: number;
};

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

export function parseClientProjectsParams(
  raw: Record<string, string | string[] | undefined>,
): ClientProjectsParams {
  return {
    query: parseStringParam(raw.q),
    page: parsePageValue(raw.page),
  };
}

export function buildClientProjectsHref(input: {
  query?: string | null;
  page?: number;
} = {}): string {
  const params = new URLSearchParams();

  const query = input.query?.trim();
  if (query) {
    params.set("q", query);
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  const search = params.toString();
  return search ? `/client/projects?${search}` : "/client/projects";
}
