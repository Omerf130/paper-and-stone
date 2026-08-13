import type { HomepageSectionKey } from "@/types/cms-content";

export type PublicCmsImageView = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type PublicCmsCtaView = {
  label: string;
  href: string;
  isVisible?: boolean;
};

export type PublicHomepageCategoryTileView = {
  id: string;
  title: string;
  layout: "large" | "medium";
  image?: PublicCmsImageView;
  href?: string;
};

export type PublicHomepageHeroView = {
  eyebrow: string;
  heading: string;
  supportingText: string;
  image?: PublicCmsImageView;
  primaryCta: PublicCmsCtaView;
  secondaryCta: PublicCmsCtaView;
};

export type PublicHomepageCategoriesSectionView = {
  eyebrow: string;
  heading: string;
  supportingText: string;
  tiles: PublicHomepageCategoryTileView[];
};

export type PublicHomepageFeaturedProductsSectionView = {
  eyebrow: string;
  heading: string;
  supportingText?: string;
  cta: PublicCmsCtaView;
};

export type PublicHomepageAboutSectionView = {
  eyebrow: string;
  heading: string;
  lead: string;
  body: string;
  image?: PublicCmsImageView;
};

export type PublicHomepageProfessionalStepView = {
  id: string;
  step: string;
  title: string;
};

export type PublicHomepageProfessionalsSectionView = {
  eyebrow: string;
  heading: string;
  body: string;
  image?: PublicCmsImageView;
  steps: PublicHomepageProfessionalStepView[];
  primaryCta: PublicCmsCtaView;
  secondaryCta: PublicCmsCtaView;
};

export type PublicHomepageInspirationItemView = {
  id: string;
  title: string;
  subtitle: string;
  layout: "featured" | "standard";
  image?: PublicCmsImageView;
};

export type PublicHomepageInspirationSectionView = {
  eyebrow: string;
  heading: string;
  supportingText?: string;
  showDemoNote: boolean;
  items: PublicHomepageInspirationItemView[];
};

export type PublicHomepageClosingSectionView = {
  heading: string;
  supportingText: string;
  contactNote?: string;
  primaryCta: PublicCmsCtaView;
  secondaryCta: PublicCmsCtaView;
};

export type PublicHomepageContentView = {
  sectionOrder: HomepageSectionKey[];
  hero: PublicHomepageHeroView;
  categories: PublicHomepageCategoriesSectionView;
  featuredProducts: PublicHomepageFeaturedProductsSectionView;
  about: PublicHomepageAboutSectionView;
  professionals: PublicHomepageProfessionalsSectionView;
  inspiration: PublicHomepageInspirationSectionView;
  closing: PublicHomepageClosingSectionView;
  sectionVisibility: Record<HomepageSectionKey, boolean>;
};
