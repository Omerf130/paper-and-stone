export type PublicCmsImageView = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type PublicContactItemView = {
  kind: "email" | "phone" | "whatsapp" | "address";
  label: string;
  href?: string;
  value: string;
};

export type PublicSiteSettingsView = {
  brandName: string;
  logo?: PublicCmsImageView;
  footerDescription: string;
  copyrightCompanyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappPhone?: string;
  address?: string;
  contactItems: PublicContactItemView[];
  hasContactDetails: boolean;
};
