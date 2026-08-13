import mongoose, { Schema, type Document, type Model } from "mongoose";
import { CMS_SCHEMA_VERSION } from "@/lib/cms/cms-constants";
import {
  cmsImageSchema,
  siteSettingsSeoSchema,
  type ICmsImage,
  type ISiteSettingsSeo,
} from "@/models/cms/cms-schemas";
import { CMS_SINGLETON_KEYS } from "@/types/cms-content";

export interface ISiteSettings extends Document {
  key: typeof CMS_SINGLETON_KEYS.site;
  schemaVersion: number;
  brandName: string;
  logo?: ICmsImage;
  contactEmail?: string;
  contactPhone?: string;
  whatsappPhone?: string;
  address?: string;
  footerDescription: string;
  copyrightCompanyName?: string;
  seo?: ISiteSettingsSeo;
  createdAt: Date;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      enum: [CMS_SINGLETON_KEYS.site],
      default: CMS_SINGLETON_KEYS.site,
    },
    schemaVersion: { type: Number, default: CMS_SCHEMA_VERSION, min: 1 },
    brandName: { type: String, required: true, trim: true },
    logo: cmsImageSchema,
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    whatsappPhone: { type: String, trim: true },
    address: { type: String, trim: true },
    footerDescription: { type: String, required: true, trim: true },
    copyrightCompanyName: { type: String, trim: true },
    seo: siteSettingsSeoSchema,
  },
  { timestamps: true },
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ??
  mongoose.model<ISiteSettings>("SiteSettings", siteSettingsSchema);

export default SiteSettings;
