import { connectDB } from "@/lib/db/mongoose";
import { CMS_SCHEMA_VERSION } from "@/lib/cms/cms-constants";
import SiteSettings from "@/models/SiteSettings";
import { CMS_SINGLETON_KEYS } from "@/types/cms-content";

export type SiteSettingsWriteFields = {
  brandName: string;
  logo?: {
    url: string;
    storageKey: string;
    alt?: string;
    isDecorative?: boolean;
    width?: number;
    height?: number;
  };
  contactEmail?: string;
  contactPhone?: string;
  whatsappPhone?: string;
  address?: string;
  footerDescription: string;
  copyrightCompanyName?: string;
  seo?: {
    defaultTitle?: string;
    defaultDescription?: string;
  };
};

export class SiteSettingsMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SiteSettingsMutationError";
  }
}

export async function upsertSiteSettings(
  fields: Omit<SiteSettingsWriteFields, "logo">,
): Promise<void> {
  await connectDB();

  const update: Record<string, unknown> = {
    key: CMS_SINGLETON_KEYS.site,
    schemaVersion: CMS_SCHEMA_VERSION,
    brandName: fields.brandName,
    footerDescription: fields.footerDescription,
    contactEmail: fields.contactEmail,
    contactPhone: fields.contactPhone,
    whatsappPhone: fields.whatsappPhone,
    address: fields.address,
    copyrightCompanyName: fields.copyrightCompanyName,
    seo: fields.seo,
  };

  await SiteSettings.findOneAndUpdate(
    { key: CMS_SINGLETON_KEYS.site },
    { $set: update },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
}
