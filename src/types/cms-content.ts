export const CMS_SINGLETON_KEYS = {
  site: "site",
  homepage: "homepage",
  catalog: "catalog",
} as const;

export type CmsSingletonKey =
  (typeof CMS_SINGLETON_KEYS)[keyof typeof CMS_SINGLETON_KEYS];

export const HOMEPAGE_SECTION_KEYS = [
  "hero",
  "categories",
  "featuredProducts",
  "about",
  "professionals",
  "inspiration",
  "closing",
] as const;

export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number];

export const DEFAULT_HOMEPAGE_SECTION_ORDER: HomepageSectionKey[] = [
  ...HOMEPAGE_SECTION_KEYS,
];

export type CmsImageView = {
  url: string;
  storageKey: string;
  alt?: string;
  isDecorative?: boolean;
  width?: number;
  height?: number;
};

export type CmsCtaView = {
  label: string;
  href: string;
  isVisible?: boolean;
};

export type HomepageCategoryPresentationItemView = {
  id: string;
  categoryId?: string;
  displayTitle?: string;
  image?: CmsImageView;
  layout: "large" | "medium";
  isVisible: boolean;
  order: number;
};

export type HomepageInspirationItemView = {
  id: string;
  title: string;
  subtitle: string;
  image?: CmsImageView;
  layout: "featured" | "standard";
  isVisible: boolean;
  order: number;
};

export type HomepageProfessionalStepView = {
  id: string;
  step: string;
  title: string;
  order: number;
};

export type HomepageHeroContentView = {
  eyebrow: string;
  heading: string;
  supportingText: string;
  image?: CmsImageView;
  primaryCta: CmsCtaView;
  secondaryCta: CmsCtaView;
  isVisible: boolean;
};

export type HomepageCategoriesSectionContentView = {
  eyebrow: string;
  heading: string;
  supportingText: string;
  items: HomepageCategoryPresentationItemView[];
  isVisible: boolean;
};

export type HomepageFeaturedProductsSectionContentView = {
  eyebrow: string;
  heading: string;
  supportingText?: string;
  cta: CmsCtaView;
  isVisible: boolean;
};

export type HomepageAboutSectionContentView = {
  eyebrow: string;
  heading: string;
  body: string;
  image?: CmsImageView;
  isVisible: boolean;
};

export type HomepageProfessionalsSectionContentView = {
  eyebrow: string;
  heading: string;
  body: string;
  image?: CmsImageView;
  steps: HomepageProfessionalStepView[];
  primaryCta: CmsCtaView;
  secondaryCta: CmsCtaView;
  isVisible: boolean;
};

export type HomepageInspirationSectionContentView = {
  eyebrow: string;
  heading: string;
  supportingText?: string;
  items: HomepageInspirationItemView[];
  isVisible: boolean;
  isContentManaged?: boolean;
};

export type HomepageClosingSectionContentView = {
  heading: string;
  supportingText: string;
  contactNote?: string;
  primaryCta: CmsCtaView;
  secondaryCta: CmsCtaView;
  isVisible: boolean;
};

export type SiteSettingsSeoView = {
  defaultTitle?: string;
  defaultDescription?: string;
};

export type SiteSettingsView = {
  key: typeof CMS_SINGLETON_KEYS.site;
  schemaVersion: number;
  brandName: string;
  logo?: CmsImageView;
  contactEmail?: string;
  contactPhone?: string;
  whatsappPhone?: string;
  address?: string;
  footerDescription: string;
  copyrightCompanyName?: string;
  seo?: SiteSettingsSeoView;
};

export type HomepageContentView = {
  key: typeof CMS_SINGLETON_KEYS.homepage;
  schemaVersion: number;
  sectionOrder: HomepageSectionKey[];
  hero: HomepageHeroContentView;
  categories: HomepageCategoriesSectionContentView;
  featuredProducts: HomepageFeaturedProductsSectionContentView;
  about: HomepageAboutSectionContentView;
  professionals: HomepageProfessionalsSectionContentView;
  inspiration: HomepageInspirationSectionContentView;
  closing: HomepageClosingSectionContentView;
};

export type CatalogPageContentView = {
  key: typeof CMS_SINGLETON_KEYS.catalog;
  schemaVersion: number;
  eyebrow: string;
  heading: string;
  supportingText: string;
};
