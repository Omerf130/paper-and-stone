import type { CmsCtaView, CmsImageView, HomepageContentView } from "@/types/cms-content";
import type {
  PublicCmsCtaView,
  PublicCmsImageView,
  PublicHomepageContentView,
} from "@/types/public-homepage-content";
import type { HomepageCategoryRecord } from "@/lib/cms/get-homepage-category-records";
import { resolvePublicHomepageCategoryTiles } from "@/lib/cms/resolve-public-homepage-category-tiles";

function mapPublicCmsImage(image: CmsImageView | undefined): PublicCmsImageView | undefined {
  if (!image) {
    return undefined;
  }

  return {
    url: image.url,
    alt: image.isDecorative ? "" : image.alt?.trim() || "",
    width: image.width,
    height: image.height,
  };
}

function mapPublicCta(cta: CmsCtaView): PublicCmsCtaView {
  return {
    label: cta.label,
    href: cta.href,
    isVisible: cta.isVisible,
  };
}

export function splitAboutBody(body: string): { lead: string; body: string } {
  const separatorIndex = body.indexOf("\n\n");

  if (separatorIndex === -1) {
    return { lead: body, body: "" };
  }

  return {
    lead: body.slice(0, separatorIndex),
    body: body.slice(separatorIndex + 2),
  };
}

export function mapHomepageToPublic(
  content: HomepageContentView,
  categoryRecords: Map<string, HomepageCategoryRecord>,
): PublicHomepageContentView {
  const aboutParts = splitAboutBody(content.about.body);

  return {
    sectionOrder: [...content.sectionOrder],
    hero: {
      eyebrow: content.hero.eyebrow,
      heading: content.hero.heading,
      supportingText: content.hero.supportingText,
      image: mapPublicCmsImage(content.hero.image),
      primaryCta: mapPublicCta(content.hero.primaryCta),
      secondaryCta: mapPublicCta(content.hero.secondaryCta),
    },
    categories: {
      eyebrow: content.categories.eyebrow,
      heading: content.categories.heading,
      supportingText: content.categories.supportingText,
      tiles: resolvePublicHomepageCategoryTiles(
        content.categories.items,
        categoryRecords,
      ),
    },
    featuredProducts: {
      eyebrow: content.featuredProducts.eyebrow,
      heading: content.featuredProducts.heading,
      supportingText: content.featuredProducts.supportingText,
      cta: mapPublicCta(content.featuredProducts.cta),
    },
    about: {
      eyebrow: content.about.eyebrow,
      heading: content.about.heading,
      lead: aboutParts.lead,
      body: aboutParts.body,
      image: mapPublicCmsImage(content.about.image),
    },
    professionals: {
      eyebrow: content.professionals.eyebrow,
      heading: content.professionals.heading,
      body: content.professionals.body,
      image: mapPublicCmsImage(content.professionals.image),
      steps: [...content.professionals.steps]
        .sort((left, right) => left.order - right.order)
        .map((step) => ({
          id: step.id,
          step: step.step,
          title: step.title,
        })),
      primaryCta: mapPublicCta(content.professionals.primaryCta),
      secondaryCta: mapPublicCta(content.professionals.secondaryCta),
    },
    inspiration: {
      eyebrow: content.inspiration.eyebrow,
      heading: content.inspiration.heading,
      supportingText: content.inspiration.supportingText,
      showDemoNote: !content.inspiration.isContentManaged,
      items: [...content.inspiration.items]
        .filter((item) => item.isVisible)
        .sort((left, right) => left.order - right.order)
        .map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          layout: item.layout,
          image: mapPublicCmsImage(item.image),
        })),
    },
    closing: {
      heading: content.closing.heading,
      supportingText: content.closing.supportingText,
      contactNote: content.closing.contactNote,
      primaryCta: mapPublicCta(content.closing.primaryCta),
      secondaryCta: mapPublicCta(content.closing.secondaryCta),
    },
    sectionVisibility: {
      hero: content.hero.isVisible,
      categories: content.categories.isVisible,
      featuredProducts: content.featuredProducts.isVisible,
      about: content.about.isVisible,
      professionals: content.professionals.isVisible,
      inspiration: content.inspiration.isVisible,
      closing: content.closing.isVisible,
    },
  };
}
