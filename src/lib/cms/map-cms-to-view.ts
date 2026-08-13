import type {
  ICatalogPageContent,
} from "@/models/CatalogPageContent";
import type { IHomepageContent } from "@/models/HomepageContent";
import type { ISiteSettings } from "@/models/SiteSettings";
import type {
  ICmsCta,
  ICmsImage,
  IHomepageCategoryPresentationItem,
} from "@/models/cms/cms-schemas";
import {
  CMS_SINGLETON_KEYS,
  type CatalogPageContentView,
  type CmsCtaView,
  type CmsImageView,
  type HomepageCategoryPresentationItemView,
  type HomepageContentView,
  type SiteSettingsView,
} from "@/types/cms-content";

type LeanSiteSettings = Pick<
  ISiteSettings,
  | "key"
  | "schemaVersion"
  | "brandName"
  | "logo"
  | "contactEmail"
  | "contactPhone"
  | "whatsappPhone"
  | "address"
  | "footerDescription"
  | "copyrightCompanyName"
  | "seo"
>;

type LeanHomepageContent = Pick<
  IHomepageContent,
  | "key"
  | "schemaVersion"
  | "sectionOrder"
  | "hero"
  | "categories"
  | "featuredProducts"
  | "about"
  | "professionals"
  | "inspiration"
  | "closing"
>;

type LeanCatalogPageContent = Pick<
  ICatalogPageContent,
  "key" | "schemaVersion" | "eyebrow" | "heading" | "supportingText"
>;

function mapCmsImage(image: ICmsImage | undefined): CmsImageView | undefined {
  if (!image) {
    return undefined;
  }

  return {
    url: image.url,
    storageKey: image.storageKey,
    alt: image.alt,
    isDecorative: image.isDecorative,
    width: image.width,
    height: image.height,
  };
}

function mapCmsCta(cta: ICmsCta): CmsCtaView {
  return {
    label: cta.label,
    href: cta.href,
    isVisible: cta.isVisible,
  };
}

function mapCategoryPresentationItem(
  item: IHomepageCategoryPresentationItem,
): HomepageCategoryPresentationItemView {
  return {
    id: item.id,
    categoryId: item.categoryId?.toString(),
    displayTitle: item.displayTitle,
    image: mapCmsImage(item.image),
    layout: item.layout,
    isVisible: item.isVisible,
    order: item.order,
  };
}

export function mapSiteSettingsToView(
  document: LeanSiteSettings,
): SiteSettingsView {
  return {
    key: CMS_SINGLETON_KEYS.site,
    schemaVersion: document.schemaVersion,
    brandName: document.brandName,
    logo: mapCmsImage(document.logo),
    contactEmail: document.contactEmail,
    contactPhone: document.contactPhone,
    whatsappPhone: document.whatsappPhone,
    address: document.address,
    footerDescription: document.footerDescription,
    copyrightCompanyName: document.copyrightCompanyName,
    seo: document.seo
      ? {
          defaultTitle: document.seo.defaultTitle,
          defaultDescription: document.seo.defaultDescription,
        }
      : undefined,
  };
}

export function mapHomepageContentToView(
  document: LeanHomepageContent,
): HomepageContentView {
  return {
    key: CMS_SINGLETON_KEYS.homepage,
    schemaVersion: document.schemaVersion,
    sectionOrder: [...document.sectionOrder],
    hero: {
      eyebrow: document.hero.eyebrow,
      heading: document.hero.heading,
      supportingText: document.hero.supportingText,
      image: mapCmsImage(document.hero.image),
      primaryCta: mapCmsCta(document.hero.primaryCta),
      secondaryCta: mapCmsCta(document.hero.secondaryCta),
      isVisible: document.hero.isVisible,
    },
    categories: {
      eyebrow: document.categories.eyebrow,
      heading: document.categories.heading,
      supportingText: document.categories.supportingText,
      items: document.categories.items.map(mapCategoryPresentationItem),
      isVisible: document.categories.isVisible,
    },
    featuredProducts: {
      eyebrow: document.featuredProducts.eyebrow,
      heading: document.featuredProducts.heading,
      supportingText: document.featuredProducts.supportingText,
      cta: mapCmsCta(document.featuredProducts.cta),
      isVisible: document.featuredProducts.isVisible,
    },
    about: {
      eyebrow: document.about.eyebrow,
      heading: document.about.heading,
      body: document.about.body,
      image: mapCmsImage(document.about.image),
      isVisible: document.about.isVisible,
    },
    professionals: {
      eyebrow: document.professionals.eyebrow,
      heading: document.professionals.heading,
      body: document.professionals.body,
      image: mapCmsImage(document.professionals.image),
      steps: document.professionals.steps.map((step) => ({
        id: step.id,
        step: step.step,
        title: step.title,
        order: step.order,
      })),
      primaryCta: mapCmsCta(document.professionals.primaryCta),
      secondaryCta: mapCmsCta(document.professionals.secondaryCta),
      isVisible: document.professionals.isVisible,
    },
    inspiration: {
      eyebrow: document.inspiration.eyebrow,
      heading: document.inspiration.heading,
      supportingText: document.inspiration.supportingText,
      items: document.inspiration.items.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        image: mapCmsImage(item.image),
        layout: item.layout,
        isVisible: item.isVisible,
        order: item.order,
      })),
      isVisible: document.inspiration.isVisible,
      isContentManaged: document.inspiration.isContentManaged ?? false,
    },
    closing: {
      heading: document.closing.heading,
      supportingText: document.closing.supportingText,
      contactNote: document.closing.contactNote,
      primaryCta: mapCmsCta(document.closing.primaryCta),
      secondaryCta: mapCmsCta(document.closing.secondaryCta),
      isVisible: document.closing.isVisible,
    },
  };
}

export function mapCatalogPageContentToView(
  document: LeanCatalogPageContent,
): CatalogPageContentView {
  return {
    key: CMS_SINGLETON_KEYS.catalog,
    schemaVersion: document.schemaVersion,
    eyebrow: document.eyebrow,
    heading: document.heading,
    supportingText: document.supportingText,
  };
}

export function isSerializableCmsView(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isSerializableCmsView);
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const forbiddenKeys = ["_id", "__v", "$__", "$isNew", "_doc"];

    return Object.entries(record).every(
      ([key, nestedValue]) =>
        !forbiddenKeys.includes(key) && isSerializableCmsView(nestedValue),
    );
  }

  return false;
}
