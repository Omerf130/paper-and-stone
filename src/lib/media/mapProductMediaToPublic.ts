import type { IProductMediaItem } from "@/models/Product";
import type { PublicImageView } from "@/types/product-media";

type LeanMediaItem = Pick<
  IProductMediaItem,
  "url" | "altText" | "width" | "height" | "sortOrder"
>;

export function mapMediaItemToPublicImage(
  item: LeanMediaItem | null | undefined,
  fallbackAlt: string,
): PublicImageView | null {
  if (!item?.url) {
    return null;
  }

  const image: PublicImageView = {
    url: item.url,
    alt: item.altText?.trim() || fallbackAlt,
  };

  if (item.width !== undefined && item.width > 0) {
    image.width = item.width;
  }

  if (item.height !== undefined && item.height > 0) {
    image.height = item.height;
  }

  return image;
}

export function mapPrimaryImageToPublic(
  item: LeanMediaItem | null | undefined,
  fallbackAlt: string,
): PublicImageView | null {
  return mapMediaItemToPublicImage(item, fallbackAlt);
}

export function mapGalleryToPublic(
  items: LeanMediaItem[] | null | undefined,
  fallbackAlt: string,
): PublicImageView[] {
  if (!items?.length) {
    return [];
  }

  return items
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => mapMediaItemToPublicImage(item, fallbackAlt))
    .filter((item): item is PublicImageView => item !== null);
}

export function mapTechnicalDrawingToPublic(
  item: LeanMediaItem | null | undefined,
  fallbackAlt: string,
): PublicImageView | null {
  return mapMediaItemToPublicImage(item, fallbackAlt);
}
