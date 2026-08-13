import type { SiteSettingsFormInput } from "@/lib/cms/cms-validation";
import type { SiteSettingsView } from "@/types/cms-content";

export type SiteSettingsFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export function mapSiteSettingsViewToFormInput(
  settings: SiteSettingsView,
): SiteSettingsFormInput {
  return {
    brandName: settings.brandName,
    contactEmail: settings.contactEmail ?? "",
    contactPhone: settings.contactPhone ?? "",
    whatsappPhone: settings.whatsappPhone ?? "",
    address: settings.address ?? "",
    footerDescription: settings.footerDescription,
    copyrightCompanyName: settings.copyrightCompanyName ?? "",
    seoDefaultTitle: settings.seo?.defaultTitle ?? "",
    seoDefaultDescription: settings.seo?.defaultDescription ?? "",
  };
}
