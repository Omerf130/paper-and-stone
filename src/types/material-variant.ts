export type MaterialSwatchImage = {
  storageKey: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type MaterialVariantInput = {
  id?: string;
  name: string;
  hex?: string;
  swatchImage?: MaterialSwatchImage;
  isActive: boolean;
};
