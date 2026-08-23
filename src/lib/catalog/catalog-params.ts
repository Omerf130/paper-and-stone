export type CatalogParams = {
  query: string | null;
  categorySlug: string | null;
  page: number;
  projectId: string | null;
  roomId: string | null;
};

export type CatalogHrefInput = {
  query?: string | null;
  categorySlug?: string | null;
  page?: number;
  projectId?: string | null;
  roomId?: string | null;
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

function appendProjectContextParams(
  params: URLSearchParams,
  input: Pick<CatalogHrefInput, "projectId" | "roomId">,
): void {
  const projectId = input.projectId?.trim();
  if (projectId) {
    params.set("project", projectId);
  }

  const roomId = input.roomId?.trim();
  if (roomId) {
    params.set("room", roomId);
  }
}

export function parseCatalogParams(
  raw: Record<string, string | string[] | undefined>,
): CatalogParams {
  return {
    query: parseStringParam(raw.q),
    categorySlug: parseStringParam(raw.category),
    page: parsePageValue(raw.page),
    projectId: parseStringParam(raw.project),
    roomId: parseStringParam(raw.room),
  };
}

export function hasCatalogProjectContext(params: CatalogParams): boolean {
  return Boolean(params.projectId && params.roomId);
}

export function buildCatalogHref(input: CatalogHrefInput = {}): string {
  const params = new URLSearchParams();

  const query = input.query?.trim();
  if (query) {
    params.set("q", query);
  }

  const categorySlug = input.categorySlug?.trim();
  if (categorySlug) {
    params.set("category", categorySlug);
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  appendProjectContextParams(params, input);

  const search = params.toString();

  return search ? `/products?${search}` : "/products";
}

export function buildProductWithProjectContextHref(
  slug: string,
  input: CatalogHrefInput = {},
): string {
  const params = new URLSearchParams();

  appendProjectContextParams(params, input);

  const query = input.query?.trim();
  if (query) {
    params.set("q", query);
  }

  const categorySlug = input.categorySlug?.trim();
  if (categorySlug) {
    params.set("category", categorySlug);
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  const search = params.toString();

  return search ? `/products/${slug}?${search}` : `/products/${slug}`;
}

export function buildProjectReturnHref(
  projectId: string,
  roomId: string,
  options?: { added?: boolean },
): string {
  const params = new URLSearchParams();
  params.set("room", roomId);

  if (options?.added) {
    params.set("added", "1");
  }

  return `/professional/projects/${projectId}?${params.toString()}`;
}

export function catalogParamsToHrefInput(params: CatalogParams): CatalogHrefInput {
  return {
    query: params.query,
    categorySlug: params.categorySlug,
    page: params.page,
    projectId: params.projectId,
    roomId: params.roomId,
  };
}

export function hasCatalogFilters(params: CatalogParams): boolean {
  return Boolean(params.query || params.categorySlug);
}
