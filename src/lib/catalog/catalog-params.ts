export type CatalogSort = "name-asc" | "name-desc";

export type CatalogParams = {
  query: string | null;
  categorySlug: string | null;
  brand: string | null;
  material: string | null;
  sort: CatalogSort;
  page: number;
  projectId: string | null;
  roomId: string | null;
};

export type CatalogHrefInput = {
  query?: string | null;
  categorySlug?: string | null;
  brand?: string | null;
  material?: string | null;
  sort?: CatalogSort;
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

function parseSortParam(raw: string | string[] | undefined): CatalogSort {
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (value === "name-desc") {
    return "name-desc";
  }

  return "name-asc";
}

function appendFilterParams(
  params: URLSearchParams,
  input: Pick<CatalogHrefInput, "query" | "categorySlug" | "brand" | "material" | "sort" | "page">,
): void {
  const query = input.query?.trim();
  if (query) {
    params.set("q", query);
  }

  const categorySlug = input.categorySlug?.trim();
  if (categorySlug) {
    params.set("category", categorySlug);
  }

  const brand = input.brand?.trim();
  if (brand) {
    params.set("brand", brand);
  }

  const material = input.material?.trim();
  if (material) {
    params.set("material", material);
  }

  if (input.sort && input.sort !== "name-asc") {
    params.set("sort", input.sort);
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }
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
    brand: parseStringParam(raw.brand),
    material: parseStringParam(raw.material),
    sort: parseSortParam(raw.sort),
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

  appendFilterParams(params, input);
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
  appendFilterParams(params, input);

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
    brand: params.brand,
    material: params.material,
    sort: params.sort,
    page: params.page,
    projectId: params.projectId,
    roomId: params.roomId,
  };
}

export function hasCatalogFilters(params: CatalogParams): boolean {
  return Boolean(
    params.query || params.categorySlug || params.brand || params.material,
  );
}
