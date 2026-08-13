import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { CMS_SCHEMA_VERSION } from "@/lib/cms/cms-constants";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/cms/cms-defaults";
import { normalizeArrayOrder } from "@/lib/cms/homepage-array-helpers";
import HomepageContent from "@/models/HomepageContent";
import type {
  ICmsCta,
  ICmsImage,
  IHomepageAboutSectionContent,
  IHomepageCategoriesSectionContent,
  IHomepageCategoryPresentationItem,
  IHomepageClosingSectionContent,
  IHomepageFeaturedProductsSectionContent,
  IHomepageHeroContent,
  IHomepageInspirationItem,
  IHomepageInspirationSectionContent,
  IHomepageProfessionalStep,
  IHomepageProfessionalsSectionContent,
} from "@/models/cms/cms-schemas";
import type {
  HomepageAboutFormInput,
  HomepageCategoriesFormInput,
  HomepageClosingFormInput,
  HomepageFeaturedProductsFormInput,
  HomepageHeroFormInput,
  HomepageInspirationFormInput,
  HomepageProfessionalsFormInput,
  HomepageSectionOrderFormInput,
} from "@/lib/cms/cms-validation";
import {
  CMS_SINGLETON_KEYS,
  type HomepageSectionKey,
} from "@/types/cms-content";

export class HomepageContentMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HomepageContentMutationError";
  }
}

function mapCmsImageInput(
  image:
    | {
        url: string;
        storageKey: string;
        alt?: string;
        isDecorative?: boolean;
        width?: number;
        height?: number;
      }
    | undefined,
): ICmsImage | undefined {
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

function mapCtaInput(cta: {
  label: string;
  href: string;
  isVisible?: boolean;
}): ICmsCta {
  return {
    label: cta.label,
    href: cta.href,
    isVisible: cta.isVisible,
  };
}

function mapHeroInput(input: HomepageHeroFormInput): IHomepageHeroContent {
  return {
    eyebrow: input.eyebrow,
    heading: input.heading,
    supportingText: input.supportingText,
    image: mapCmsImageInput(input.image),
    primaryCta: mapCtaInput(input.primaryCta),
    secondaryCta: mapCtaInput(input.secondaryCta),
    isVisible: true,
  };
}

function mapCategoryItemInput(
  item: HomepageCategoriesFormInput["items"][number],
): IHomepageCategoryPresentationItem {
  return {
    id: item.id,
    categoryId: item.categoryId ? new Types.ObjectId(item.categoryId) : undefined,
    displayTitle: item.displayTitle,
    image: mapCmsImageInput(item.image),
    layout: item.layout,
    isVisible: item.isVisible,
    order: item.order,
  };
}

function mapCategoriesInput(
  input: HomepageCategoriesFormInput,
): IHomepageCategoriesSectionContent {
  return {
    eyebrow: input.eyebrow,
    heading: input.heading,
    supportingText: input.supportingText,
    items: normalizeArrayOrder(input.items).map(mapCategoryItemInput),
    isVisible: input.isVisible,
  };
}

function mapFeaturedInput(
  input: HomepageFeaturedProductsFormInput,
): IHomepageFeaturedProductsSectionContent {
  return {
    eyebrow: input.eyebrow,
    heading: input.heading,
    supportingText: input.supportingText,
    cta: mapCtaInput(input.cta),
    isVisible: input.isVisible,
  };
}

function mapAboutInput(input: HomepageAboutFormInput): IHomepageAboutSectionContent {
  return {
    eyebrow: input.eyebrow,
    heading: input.heading,
    body: input.body,
    image: mapCmsImageInput(input.image),
    isVisible: input.isVisible,
  };
}

function mapProfessionalStepInput(
  step: HomepageProfessionalsFormInput["steps"][number],
): IHomepageProfessionalStep {
  return {
    id: step.id,
    step: step.step,
    title: step.title,
    order: step.order,
  };
}

function mapProfessionalsInput(
  input: HomepageProfessionalsFormInput,
): IHomepageProfessionalsSectionContent {
  return {
    eyebrow: input.eyebrow,
    heading: input.heading,
    body: input.body,
    image: mapCmsImageInput(input.image),
    steps: normalizeArrayOrder(input.steps).map(mapProfessionalStepInput),
    primaryCta: mapCtaInput(input.primaryCta),
    secondaryCta: mapCtaInput(input.secondaryCta),
    isVisible: input.isVisible,
  };
}

function mapInspirationItemInput(
  item: HomepageInspirationFormInput["items"][number],
): IHomepageInspirationItem {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    image: mapCmsImageInput(item.image),
    layout: item.layout,
    isVisible: item.isVisible,
    order: item.order,
  };
}

function mapInspirationInput(
  input: HomepageInspirationFormInput,
): IHomepageInspirationSectionContent {
  return {
    eyebrow: input.eyebrow,
    heading: input.heading,
    supportingText: input.supportingText,
    items: normalizeArrayOrder(input.items).map(mapInspirationItemInput),
    isVisible: input.isVisible,
  };
}

function mapClosingInput(
  input: HomepageClosingFormInput,
): IHomepageClosingSectionContent {
  return {
    heading: input.heading,
    supportingText: input.supportingText,
    contactNote: input.contactNote,
    primaryCta: mapCtaInput(input.primaryCta),
    secondaryCta: mapCtaInput(input.secondaryCta),
    isVisible: input.isVisible,
  };
}

export function buildDefaultHomepageMongoDocument(): Record<string, unknown> {
  const view = structuredClone(DEFAULT_HOMEPAGE_CONTENT);

  return {
    key: CMS_SINGLETON_KEYS.homepage,
    schemaVersion: CMS_SCHEMA_VERSION,
    sectionOrder: view.sectionOrder,
    hero: mapHeroInput({ ...view.hero, isVisible: true } as HomepageHeroFormInput),
    categories: mapCategoriesInput(view.categories as HomepageCategoriesFormInput),
    featuredProducts: mapFeaturedInput(
      view.featuredProducts as HomepageFeaturedProductsFormInput,
    ),
    about: mapAboutInput(view.about as HomepageAboutFormInput),
    professionals: mapProfessionalsInput(
      view.professionals as HomepageProfessionalsFormInput,
    ),
    inspiration: {
      ...mapInspirationInput(view.inspiration as HomepageInspirationFormInput),
      isContentManaged: false,
    },
    closing: mapClosingInput(view.closing as HomepageClosingFormInput),
  };
}

async function upsertHomepageField(field: string, value: unknown): Promise<void> {
  await connectDB();

  const exists = await HomepageContent.exists({ key: CMS_SINGLETON_KEYS.homepage });

  if (!exists) {
    const mongoDoc = buildDefaultHomepageMongoDocument();
    mongoDoc[field] = value;

    await HomepageContent.findOneAndUpdate(
      { key: CMS_SINGLETON_KEYS.homepage },
      { $set: mongoDoc },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    return;
  }

  await HomepageContent.findOneAndUpdate(
    { key: CMS_SINGLETON_KEYS.homepage },
    {
      $set: {
        [field]: value,
        schemaVersion: CMS_SCHEMA_VERSION,
      },
    },
    { runValidators: true },
  );
}

export async function saveHomepageHero(input: HomepageHeroFormInput): Promise<void> {
  await upsertHomepageField("hero", mapHeroInput(input));
}

export async function saveHomepageCategories(
  input: HomepageCategoriesFormInput,
): Promise<void> {
  await upsertHomepageField("categories", mapCategoriesInput(input));
}

export async function saveHomepageFeaturedProducts(
  input: HomepageFeaturedProductsFormInput,
): Promise<void> {
  await upsertHomepageField("featuredProducts", mapFeaturedInput(input));
}

export async function saveHomepageAbout(input: HomepageAboutFormInput): Promise<void> {
  await upsertHomepageField("about", mapAboutInput(input));
}

export async function saveHomepageProfessionals(
  input: HomepageProfessionalsFormInput,
): Promise<void> {
  await upsertHomepageField("professionals", mapProfessionalsInput(input));
}

export async function saveHomepageInspiration(
  input: HomepageInspirationFormInput,
): Promise<void> {
  await upsertHomepageField("inspiration", {
    ...mapInspirationInput(input),
    isContentManaged: true,
  });
}

export async function saveHomepageClosing(
  input: HomepageClosingFormInput,
): Promise<void> {
  await upsertHomepageField("closing", mapClosingInput(input));
}

export async function saveHomepageSectionOrder(
  input: HomepageSectionOrderFormInput,
): Promise<void> {
  await upsertHomepageField("sectionOrder", [...input] as HomepageSectionKey[]);
}

export async function homepageDocumentExists(): Promise<boolean> {
  await connectDB();
  const exists = await HomepageContent.exists({ key: CMS_SINGLETON_KEYS.homepage });
  return Boolean(exists);
}
