import {
  buildMailtoHref,
  buildTelHref,
  buildWhatsAppHref,
} from "@/lib/cms/contact-link-helpers";
import type { SiteSettingsView } from "@/types/cms-content";
import type {
  PublicContactItemView,
  PublicSiteSettingsView,
} from "@/types/public-site-settings";

export function buildPublicContactItems(settings: {
  contactEmail?: string;
  contactPhone?: string;
  whatsappPhone?: string;
  address?: string;
}): PublicContactItemView[] {
  const items: PublicContactItemView[] = [];

  if (settings.contactEmail) {
    items.push({
      kind: "email",
      label: "אימייל",
      value: settings.contactEmail,
      href: buildMailtoHref(settings.contactEmail),
    });
  }

  if (settings.contactPhone) {
    items.push({
      kind: "phone",
      label: "טלפון",
      value: settings.contactPhone,
      href: buildTelHref(settings.contactPhone),
    });
  }

  if (settings.whatsappPhone) {
    const href = buildWhatsAppHref(settings.whatsappPhone);
    if (href) {
      items.push({
        kind: "whatsapp",
        label: "WhatsApp",
        value: settings.whatsappPhone,
        href,
      });
    }
  }

  if (settings.address) {
    items.push({
      kind: "address",
      label: "כתובת",
      value: settings.address,
    });
  }

  return items;
}

export function mapSiteSettingsToPublic(
  settings: SiteSettingsView,
): PublicSiteSettingsView {
  const contactItems = buildPublicContactItems(settings);

  return {
    brandName: settings.brandName,
    logo: settings.logo
      ? {
          url: settings.logo.url,
          alt: settings.logo.alt?.trim() || settings.brandName,
          width: settings.logo.width,
          height: settings.logo.height,
        }
      : undefined,
    footerDescription: settings.footerDescription,
    copyrightCompanyName: settings.copyrightCompanyName,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    whatsappPhone: settings.whatsappPhone,
    address: settings.address,
    contactItems,
    hasContactDetails: contactItems.length > 0,
  };
}
