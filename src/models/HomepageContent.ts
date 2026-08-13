import mongoose, { Schema, type Document, type Model } from "mongoose";
import { CMS_SCHEMA_VERSION } from "@/lib/cms/cms-constants";
import {
  DEFAULT_SECTION_ORDER,
  HOMEPAGE_SECTION_KEY_ENUM,
  homepageAboutSectionContentSchema,
  homepageCategoriesSectionContentSchema,
  homepageClosingSectionContentSchema,
  homepageFeaturedProductsSectionContentSchema,
  homepageHeroContentSchema,
  homepageInspirationSectionContentSchema,
  homepageProfessionalsSectionContentSchema,
  type IHomepageAboutSectionContent,
  type IHomepageCategoriesSectionContent,
  type IHomepageClosingSectionContent,
  type IHomepageFeaturedProductsSectionContent,
  type IHomepageHeroContent,
  type IHomepageInspirationSectionContent,
  type IHomepageProfessionalsSectionContent,
} from "@/models/cms/cms-schemas";
import {
  CMS_SINGLETON_KEYS,
  type HomepageSectionKey,
} from "@/types/cms-content";

export interface IHomepageContent extends Document {
  key: typeof CMS_SINGLETON_KEYS.homepage;
  schemaVersion: number;
  sectionOrder: HomepageSectionKey[];
  hero: IHomepageHeroContent;
  categories: IHomepageCategoriesSectionContent;
  featuredProducts: IHomepageFeaturedProductsSectionContent;
  about: IHomepageAboutSectionContent;
  professionals: IHomepageProfessionalsSectionContent;
  inspiration: IHomepageInspirationSectionContent;
  closing: IHomepageClosingSectionContent;
  createdAt: Date;
  updatedAt: Date;
}

const homepageContentSchema = new Schema<IHomepageContent>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      enum: [CMS_SINGLETON_KEYS.homepage],
      default: CMS_SINGLETON_KEYS.homepage,
    },
    schemaVersion: { type: Number, default: CMS_SCHEMA_VERSION, min: 1 },
    sectionOrder: {
      type: [String],
      enum: HOMEPAGE_SECTION_KEY_ENUM,
      default: DEFAULT_SECTION_ORDER,
    },
    hero: { type: homepageHeroContentSchema, required: true },
    categories: { type: homepageCategoriesSectionContentSchema, required: true },
    featuredProducts: {
      type: homepageFeaturedProductsSectionContentSchema,
      required: true,
    },
    about: { type: homepageAboutSectionContentSchema, required: true },
    professionals: {
      type: homepageProfessionalsSectionContentSchema,
      required: true,
    },
    inspiration: { type: homepageInspirationSectionContentSchema, required: true },
    closing: { type: homepageClosingSectionContentSchema, required: true },
  },
  { timestamps: true },
);

const HomepageContent: Model<IHomepageContent> =
  mongoose.models.HomepageContent ??
  mongoose.model<IHomepageContent>("HomepageContent", homepageContentSchema);

export default HomepageContent;
