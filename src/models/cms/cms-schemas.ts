import { Schema, Types } from "mongoose";
import { CMS_LIMITS } from "@/lib/cms/cms-constants";
import {
  DEFAULT_HOMEPAGE_SECTION_ORDER,
  HOMEPAGE_SECTION_KEYS,
} from "@/types/cms-content";

export interface ICmsImage {
  url: string;
  storageKey: string;
  alt?: string;
  isDecorative?: boolean;
  width?: number;
  height?: number;
}

export interface ICmsCta {
  label: string;
  href: string;
  isVisible?: boolean;
}

export interface IHomepageCategoryPresentationItem {
  id: string;
  categoryId?: Types.ObjectId;
  displayTitle?: string;
  image?: ICmsImage;
  layout: "large" | "medium";
  isVisible: boolean;
  order: number;
}

export interface IHomepageInspirationItem {
  id: string;
  title: string;
  subtitle: string;
  image?: ICmsImage;
  layout: "featured" | "standard";
  isVisible: boolean;
  order: number;
}

export interface IHomepageProfessionalStep {
  id: string;
  step: string;
  title: string;
  order: number;
}

export interface IHomepageHeroContent {
  eyebrow: string;
  heading: string;
  supportingText: string;
  image?: ICmsImage;
  primaryCta: ICmsCta;
  secondaryCta: ICmsCta;
  isVisible: boolean;
}

export interface IHomepageCategoriesSectionContent {
  eyebrow: string;
  heading: string;
  supportingText: string;
  items: IHomepageCategoryPresentationItem[];
  isVisible: boolean;
}

export interface IHomepageFeaturedProductsSectionContent {
  eyebrow: string;
  heading: string;
  supportingText?: string;
  cta: ICmsCta;
  isVisible: boolean;
}

export interface IHomepageAboutSectionContent {
  eyebrow: string;
  heading: string;
  body: string;
  image?: ICmsImage;
  isVisible: boolean;
}

export interface IHomepageProfessionalsSectionContent {
  eyebrow: string;
  heading: string;
  body: string;
  image?: ICmsImage;
  steps: IHomepageProfessionalStep[];
  primaryCta: ICmsCta;
  secondaryCta: ICmsCta;
  isVisible: boolean;
}

export interface IHomepageInspirationSectionContent {
  eyebrow: string;
  heading: string;
  supportingText?: string;
  items: IHomepageInspirationItem[];
  isVisible: boolean;
  isContentManaged?: boolean;
}

export interface IHomepageClosingSectionContent {
  heading: string;
  supportingText: string;
  contactNote?: string;
  primaryCta: ICmsCta;
  secondaryCta: ICmsCta;
  isVisible: boolean;
}

export interface ISiteSettingsSeo {
  defaultTitle?: string;
  defaultDescription?: string;
}

export const cmsImageSchema = new Schema<ICmsImage>(
  {
    url: { type: String, required: true, trim: true },
    storageKey: { type: String, required: true, trim: true },
    alt: { type: String, trim: true, maxlength: CMS_LIMITS.imageAlt },
    isDecorative: { type: Boolean, default: false },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
  },
  { _id: false },
);

export const cmsCtaSchema = new Schema<ICmsCta>(
  {
    label: { type: String, required: true, trim: true, maxlength: CMS_LIMITS.ctaLabel },
    href: { type: String, required: true, trim: true, maxlength: CMS_LIMITS.ctaHref },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false },
);

export const homepageCategoryPresentationItemSchema =
  new Schema<IHomepageCategoryPresentationItem>(
    {
      id: { type: String, required: true, trim: true },
      categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
      displayTitle: {
        type: String,
        trim: true,
        maxlength: CMS_LIMITS.categoryDisplayTitle,
      },
      image: cmsImageSchema,
      layout: { type: String, enum: ["large", "medium"], required: true },
      isVisible: { type: Boolean, default: true },
      order: { type: Number, required: true, min: 0 },
    },
    { _id: false },
  );

export const homepageInspirationItemSchema = new Schema<IHomepageInspirationItem>(
  {
    id: { type: String, required: true, trim: true },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: CMS_LIMITS.inspirationTitle,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: CMS_LIMITS.inspirationSubtitle,
    },
    image: cmsImageSchema,
    layout: { type: String, enum: ["featured", "standard"], required: true },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

export const homepageProfessionalStepSchema = new Schema<IHomepageProfessionalStep>(
  {
    id: { type: String, required: true, trim: true },
    step: {
      type: String,
      required: true,
      trim: true,
      maxlength: CMS_LIMITS.professionalStepNumber,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: CMS_LIMITS.professionalStepTitle,
    },
    order: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

export const homepageHeroContentSchema = new Schema<IHomepageHeroContent>(
  {
    eyebrow: {
      type: String,
      required: true,
      trim: true,
      maxlength: CMS_LIMITS.eyebrow,
    },
    heading: {
      type: String,
      required: true,
      trim: true,
      maxlength: CMS_LIMITS.heading,
    },
    supportingText: {
      type: String,
      required: true,
      trim: true,
      maxlength: CMS_LIMITS.supportingText,
    },
    image: cmsImageSchema,
    primaryCta: { type: cmsCtaSchema, required: true },
    secondaryCta: { type: cmsCtaSchema, required: true },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false },
);

export const homepageCategoriesSectionContentSchema =
  new Schema<IHomepageCategoriesSectionContent>(
    {
      eyebrow: {
        type: String,
        required: true,
        trim: true,
        maxlength: CMS_LIMITS.eyebrow,
      },
      heading: {
        type: String,
        required: true,
        trim: true,
        maxlength: CMS_LIMITS.heading,
      },
      supportingText: {
        type: String,
        required: true,
        trim: true,
        maxlength: CMS_LIMITS.supportingText,
      },
      items: {
        type: [homepageCategoryPresentationItemSchema],
        default: [],
        validate: {
          validator(value: IHomepageCategoryPresentationItem[]) {
            return value.length <= CMS_LIMITS.homepageCategoryItems;
          },
          message: "Too many homepage category items.",
        },
      },
      isVisible: { type: Boolean, default: true },
    },
    { _id: false },
  );

export const homepageFeaturedProductsSectionContentSchema =
  new Schema<IHomepageFeaturedProductsSectionContent>(
    {
      eyebrow: {
        type: String,
        required: true,
        trim: true,
        maxlength: CMS_LIMITS.eyebrow,
      },
      heading: {
        type: String,
        required: true,
        trim: true,
        maxlength: CMS_LIMITS.heading,
      },
      supportingText: {
        type: String,
        trim: true,
        maxlength: CMS_LIMITS.supportingText,
      },
      cta: { type: cmsCtaSchema, required: true },
      isVisible: { type: Boolean, default: true },
    },
    { _id: false },
  );

export const homepageAboutSectionContentSchema = new Schema<IHomepageAboutSectionContent>(
  {
    eyebrow: {
      type: String,
      required: true,
      trim: true,
      maxlength: CMS_LIMITS.eyebrow,
    },
    heading: {
      type: String,
      required: true,
      trim: true,
      maxlength: CMS_LIMITS.heading,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: CMS_LIMITS.body,
    },
    image: cmsImageSchema,
    isVisible: { type: Boolean, default: true },
  },
  { _id: false },
);

export const homepageProfessionalsSectionContentSchema =
  new Schema<IHomepageProfessionalsSectionContent>(
    {
      eyebrow: {
        type: String,
        required: true,
        trim: true,
        maxlength: CMS_LIMITS.eyebrow,
      },
      heading: {
        type: String,
        required: true,
        trim: true,
        maxlength: CMS_LIMITS.heading,
      },
      body: {
        type: String,
        required: true,
        trim: true,
        maxlength: CMS_LIMITS.body,
      },
      image: cmsImageSchema,
      steps: {
        type: [homepageProfessionalStepSchema],
        default: [],
        validate: {
          validator(value: IHomepageProfessionalStep[]) {
            return value.length <= CMS_LIMITS.professionalSteps;
          },
          message: "Too many professional steps.",
        },
      },
      primaryCta: { type: cmsCtaSchema, required: true },
      secondaryCta: { type: cmsCtaSchema, required: true },
      isVisible: { type: Boolean, default: true },
    },
    { _id: false },
  );

export const homepageInspirationSectionContentSchema =
  new Schema<IHomepageInspirationSectionContent>(
    {
      eyebrow: {
        type: String,
        required: true,
        trim: true,
        maxlength: CMS_LIMITS.eyebrow,
      },
      heading: {
        type: String,
        required: true,
        trim: true,
        maxlength: CMS_LIMITS.heading,
      },
      supportingText: {
        type: String,
        trim: true,
        maxlength: CMS_LIMITS.supportingText,
      },
      items: {
        type: [homepageInspirationItemSchema],
        default: [],
        validate: {
          validator(value: IHomepageInspirationItem[]) {
            return value.length <= CMS_LIMITS.inspirationItems;
          },
          message: "Too many inspiration items.",
        },
      },
      isVisible: { type: Boolean, default: true },
      isContentManaged: { type: Boolean, default: false },
    },
    { _id: false },
  );

export const homepageClosingSectionContentSchema =
  new Schema<IHomepageClosingSectionContent>(
    {
      heading: {
        type: String,
        required: true,
        trim: true,
        maxlength: CMS_LIMITS.heading,
      },
      supportingText: {
        type: String,
        required: true,
        trim: true,
        maxlength: CMS_LIMITS.supportingText,
      },
      contactNote: {
        type: String,
        trim: true,
        maxlength: CMS_LIMITS.supportingText,
      },
      primaryCta: { type: cmsCtaSchema, required: true },
      secondaryCta: { type: cmsCtaSchema, required: true },
      isVisible: { type: Boolean, default: true },
    },
    { _id: false },
  );

export const siteSettingsSeoSchema = new Schema<ISiteSettingsSeo>(
  {
    defaultTitle: { type: String, trim: true, maxlength: CMS_LIMITS.seoTitle },
    defaultDescription: {
      type: String,
      trim: true,
      maxlength: CMS_LIMITS.seoDescription,
    },
  },
  { _id: false },
);

export const DEFAULT_SECTION_ORDER = [...DEFAULT_HOMEPAGE_SECTION_ORDER];

export const HOMEPAGE_SECTION_KEY_ENUM = [...HOMEPAGE_SECTION_KEYS];
