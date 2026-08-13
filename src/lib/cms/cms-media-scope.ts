export const CMS_MEDIA_SCOPES = {
  siteLogo: "site.logo",
  homepageHero: "homepage.hero",
  homepageAbout: "homepage.about",
  homepageProfessionals: "homepage.professionals",
  homepageCategory: "homepage.category",
  homepageInspiration: "homepage.inspiration",
  catalogHero: "catalog.hero",
} as const;

export type CmsMediaScope = (typeof CMS_MEDIA_SCOPES)[keyof typeof CMS_MEDIA_SCOPES];

const WRITABLE_SCOPES_16C: ReadonlySet<CmsMediaScope> = new Set([
  CMS_MEDIA_SCOPES.siteLogo,
  CMS_MEDIA_SCOPES.homepageHero,
  CMS_MEDIA_SCOPES.homepageAbout,
  CMS_MEDIA_SCOPES.homepageProfessionals,
  CMS_MEDIA_SCOPES.homepageCategory,
  CMS_MEDIA_SCOPES.homepageInspiration,
]);

export type ParsedCmsMediaScope = {
  scope: string;
  field: string;
};

export type CmsMediaScopeOptions = {
  itemId?: string;
};

const ARRAY_ITEM_SCOPES: ReadonlySet<CmsMediaScope> = new Set([
  CMS_MEDIA_SCOPES.homepageCategory,
  CMS_MEDIA_SCOPES.homepageInspiration,
]);

export function parseCmsMediaScope(value: string): ParsedCmsMediaScope | null {
  const parts = value.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [scope, field] = parts;
  if (!scope || !field) {
    return null;
  }

  return { scope, field };
}

export function isKnownCmsMediaScope(value: string): value is CmsMediaScope {
  return Object.values(CMS_MEDIA_SCOPES).includes(value as CmsMediaScope);
}

export function isWritableCmsMediaScope(value: string): value is CmsMediaScope {
  return isKnownCmsMediaScope(value) && WRITABLE_SCOPES_16C.has(value);
}

export function cmsMediaScopeRequiresItemId(value: CmsMediaScope): boolean {
  return ARRAY_ITEM_SCOPES.has(value);
}
