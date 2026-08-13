import { connectDB } from "@/lib/db/mongoose";
import {
  CMS_MEDIA_SCOPES,
  cmsMediaScopeRequiresItemId,
  isWritableCmsMediaScope,
  type CmsMediaScope,
} from "@/lib/cms/cms-media-scope";
import { CMS_MEDIA_ERRORS } from "@/lib/cms/cms-media-validation";
import { buildDefaultHomepageMongoDocument } from "@/lib/cms/homepage-content-mutations";
import { deleteOldBlobBestEffort, rollbackNewBlobBestEffort } from "@/lib/media/product-media-mutations";
import HomepageContent from "@/models/HomepageContent";
import SiteSettings from "@/models/SiteSettings";
import type { ICmsImage } from "@/models/cms/cms-schemas";
import { CMS_SINGLETON_KEYS } from "@/types/cms-content";

export class CmsMediaMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CmsMediaMutationError";
  }
}

export type PersistCmsImageInput = {
  url: string;
  storageKey: string;
  alt?: string;
  isDecorative?: boolean;
  width?: number;
  height?: number;
};

export type PersistSiteLogoInput = PersistCmsImageInput;

async function getSiteSettingsDocument() {
  await connectDB();
  return SiteSettings.findOne({ key: CMS_SINGLETON_KEYS.site });
}

export async function getCurrentSiteLogoStorageKey(): Promise<string | null> {
  await connectDB();
  const document = await SiteSettings.findOne({ key: CMS_SINGLETON_KEYS.site })
    .select("logo.storageKey")
    .lean();

  return document?.logo?.storageKey ?? null;
}

export async function siteLogoExistsByStorageKey(storageKey: string): Promise<boolean> {
  await connectDB();
  const document = await SiteSettings.findOne({
    key: CMS_SINGLETON_KEYS.site,
    "logo.storageKey": storageKey,
  })
    .select("_id")
    .lean();

  return Boolean(document);
}

export async function persistSiteLogo(
  input: PersistSiteLogoInput,
): Promise<{ oldStorageKey: string | null }> {
  const logo: ICmsImage = {
    url: input.url,
    storageKey: input.storageKey,
    alt: input.alt?.trim() || undefined,
    isDecorative: false,
    width: input.width,
    height: input.height,
  };

  let document = await getSiteSettingsDocument();
  const oldStorageKey = document?.logo?.storageKey ?? null;

  if (!document) {
    document = new SiteSettings({
      key: CMS_SINGLETON_KEYS.site,
      brandName: "Paper & Stone",
      footerDescription: "ריהוט, חומרים ופתרונות לפרויקטים",
      logo,
    });
    await document.save();
    return { oldStorageKey: null };
  }

  document.logo = logo;
  document.markModified("logo");
  await document.save();

  return { oldStorageKey };
}

export async function applySiteLogoUploadWithReplace(
  input: PersistSiteLogoInput,
): Promise<void> {
  const { oldStorageKey } = await persistSiteLogo(input);

  try {
    await deleteOldBlobBestEffort(oldStorageKey);
  } catch {
    // Best-effort cleanup; MongoDB remains source of truth.
  }
}

export async function applySiteLogoUploadIdempotent(
  input: PersistSiteLogoInput,
): Promise<void> {
  const exists = await siteLogoExistsByStorageKey(input.storageKey);
  if (exists) {
    return;
  }

  try {
    await applySiteLogoUploadWithReplace(input);
  } catch (error) {
    await rollbackNewBlobBestEffort(input.storageKey);
    throw error;
  }
}

export async function removeSiteLogo(): Promise<string | null> {
  const document = await getSiteSettingsDocument();
  if (!document?.logo) {
    return null;
  }

  const storageKey = document.logo.storageKey;
  document.logo = undefined;
  document.markModified("logo");
  await document.save();

  return storageKey;
}

export async function applySiteLogoRemove(): Promise<void> {
  const storageKey = await removeSiteLogo();
  await deleteOldBlobBestEffort(storageKey);
}

export function assertWritableCmsMediaScope(mediaScope: string): asserts mediaScope is CmsMediaScope {
  if (!isWritableCmsMediaScope(mediaScope)) {
    throw new CmsMediaMutationError(CMS_MEDIA_ERRORS.INVALID_SCOPE);
  }
}

/** @deprecated Use assertWritableCmsMediaScope */
export function assertWritableSiteLogoScope(mediaScope: string): void {
  if (mediaScope !== CMS_MEDIA_SCOPES.siteLogo) {
    throw new CmsMediaMutationError(CMS_MEDIA_ERRORS.INVALID_SCOPE);
  }
}

async function getHomepageContentDocument() {
  await connectDB();
  return HomepageContent.findOne({ key: CMS_SINGLETON_KEYS.homepage });
}

async function ensureHomepageDocumentForMedia() {
  let document = await getHomepageContentDocument();
  if (document) {
    return document;
  }

  await HomepageContent.findOneAndUpdate(
    { key: CMS_SINGLETON_KEYS.homepage },
    { $set: buildDefaultHomepageMongoDocument() },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  document = await getHomepageContentDocument();
  if (!document) {
    throw new CmsMediaMutationError(CMS_MEDIA_ERRORS.GENERIC);
  }

  return document;
}

function buildImageRecord(input: PersistCmsImageInput): ICmsImage {
  return {
    url: input.url,
    storageKey: input.storageKey,
    alt: input.alt?.trim() || undefined,
    isDecorative: input.isDecorative ?? false,
    width: input.width,
    height: input.height,
  };
}

async function persistHomepageScalarImage(
  fieldPath: "hero.image" | "about.image" | "professionals.image",
  input: PersistCmsImageInput,
): Promise<{ oldStorageKey: string | null }> {
  const document = await ensureHomepageDocumentForMedia();
  const [section, field] = fieldPath.split(".") as [string, string];
  const sectionData = document.get(section) as Record<string, unknown> | undefined;
  const oldImage = sectionData?.[field] as ICmsImage | undefined;
  const oldStorageKey = oldImage?.storageKey ?? null;
  const image = buildImageRecord(input);

  document.set(`${section}.${field}`, image);
  document.markModified(section);
  await document.save();

  return { oldStorageKey };
}

async function persistHomepageArrayItemImage(
  arrayPath: "categories.items" | "inspiration.items",
  itemId: string,
  input: PersistCmsImageInput,
): Promise<{ oldStorageKey: string | null }> {
  const document = await ensureHomepageDocumentForMedia();
  const [section, itemsKey] = arrayPath.split(".") as [string, string];
  const sectionData = document.get(section) as
    | { items: Array<{ id: string; image?: ICmsImage }> }
    | undefined;
  const items = sectionData?.[itemsKey as "items"];

  if (!items) {
    throw new CmsMediaMutationError(CMS_MEDIA_ERRORS.GENERIC);
  }

  const itemIndex = items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) {
    throw new CmsMediaMutationError("פריט לא נמצא. שמרו את הסקשן לפני העלאת תמונה.");
  }

  const oldStorageKey = items[itemIndex]?.image?.storageKey ?? null;
  const image = buildImageRecord(input);

  document.set(`${section}.${itemsKey}.${itemIndex}.image`, image);
  document.markModified(section);
  await document.save();

  return { oldStorageKey };
}

async function removeHomepageScalarImage(
  fieldPath: "hero.image" | "about.image" | "professionals.image",
): Promise<string | null> {
  const document = await getHomepageContentDocument();
  if (!document) {
    return null;
  }

  const [section, field] = fieldPath.split(".") as [string, string];
  const sectionData = document.get(section) as Record<string, unknown> | undefined;
  const oldImage = sectionData?.[field] as ICmsImage | undefined;

  if (!oldImage) {
    return null;
  }

  const storageKey = oldImage.storageKey;
  document.set(`${section}.${field}`, undefined);
  document.markModified(section);
  await document.save();

  return storageKey;
}

async function removeHomepageArrayItemImage(
  arrayPath: "categories.items" | "inspiration.items",
  itemId: string,
): Promise<string | null> {
  const document = await getHomepageContentDocument();
  if (!document) {
    return null;
  }

  const [section, itemsKey] = arrayPath.split(".") as [string, string];
  const sectionData = document.get(section) as
    | { items: Array<{ id: string; image?: ICmsImage }> }
    | undefined;
  const items = sectionData?.[itemsKey as "items"];

  if (!items) {
    return null;
  }

  const itemIndex = items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) {
    return null;
  }

  const storageKey = items[itemIndex]?.image?.storageKey ?? null;
  if (!storageKey) {
    return null;
  }

  document.set(`${section}.${itemsKey}.${itemIndex}.image`, undefined);
  document.markModified(section);
  await document.save();

  return storageKey;
}

async function applyUploadWithReplace(
  persist: () => Promise<{ oldStorageKey: string | null }>,
  rollbackKey: string,
): Promise<void> {
  try {
    const { oldStorageKey } = await persist();
    await deleteOldBlobBestEffort(oldStorageKey);
  } catch (error) {
    await rollbackNewBlobBestEffort(rollbackKey);
    throw error;
  }
}

async function applyUploadIdempotent(
  storageKey: string,
  existsCheck: () => Promise<boolean>,
  persist: () => Promise<{ oldStorageKey: string | null }>,
): Promise<void> {
  const exists = await existsCheck();
  if (exists) {
    return;
  }

  await applyUploadWithReplace(persist, storageKey);
}

export async function applyHomepageMediaUpload(input: {
  mediaScope: CmsMediaScope;
  itemId?: string;
  image: PersistCmsImageInput;
}): Promise<void> {
  assertWritableCmsMediaScope(input.mediaScope);

  if (cmsMediaScopeRequiresItemId(input.mediaScope) && !input.itemId) {
    throw new CmsMediaMutationError(CMS_MEDIA_ERRORS.INVALID_PAYLOAD);
  }

  const existsByKey = async () => {
    await connectDB();
    const query: Record<string, unknown> = {
      key: CMS_SINGLETON_KEYS.homepage,
    };

    if (input.mediaScope === CMS_MEDIA_SCOPES.homepageHero) {
      query["hero.image.storageKey"] = input.image.storageKey;
    } else if (input.mediaScope === CMS_MEDIA_SCOPES.homepageAbout) {
      query["about.image.storageKey"] = input.image.storageKey;
    } else if (input.mediaScope === CMS_MEDIA_SCOPES.homepageProfessionals) {
      query["professionals.image.storageKey"] = input.image.storageKey;
    } else if (input.mediaScope === CMS_MEDIA_SCOPES.homepageCategory) {
      query["categories.items"] = {
        $elemMatch: { id: input.itemId, "image.storageKey": input.image.storageKey },
      };
    } else if (input.mediaScope === CMS_MEDIA_SCOPES.homepageInspiration) {
      query["inspiration.items"] = {
        $elemMatch: { id: input.itemId, "image.storageKey": input.image.storageKey },
      };
    }

    const document = await HomepageContent.findOne(query).select("_id").lean();
    return Boolean(document);
  };

  const persist = async () => {
    switch (input.mediaScope) {
      case CMS_MEDIA_SCOPES.homepageHero:
        return persistHomepageScalarImage("hero.image", input.image);
      case CMS_MEDIA_SCOPES.homepageAbout:
        return persistHomepageScalarImage("about.image", input.image);
      case CMS_MEDIA_SCOPES.homepageProfessionals:
        return persistHomepageScalarImage("professionals.image", input.image);
      case CMS_MEDIA_SCOPES.homepageCategory:
        return persistHomepageArrayItemImage(
          "categories.items",
          input.itemId!,
          input.image,
        );
      case CMS_MEDIA_SCOPES.homepageInspiration:
        return persistHomepageArrayItemImage(
          "inspiration.items",
          input.itemId!,
          input.image,
        );
      default:
        throw new CmsMediaMutationError(CMS_MEDIA_ERRORS.INVALID_SCOPE);
    }
  };

  await applyUploadIdempotent(input.image.storageKey, existsByKey, persist);
}

export async function applyHomepageMediaRemove(input: {
  mediaScope: CmsMediaScope;
  itemId?: string;
}): Promise<void> {
  assertWritableCmsMediaScope(input.mediaScope);

  if (cmsMediaScopeRequiresItemId(input.mediaScope) && !input.itemId) {
    throw new CmsMediaMutationError(CMS_MEDIA_ERRORS.INVALID_PAYLOAD);
  }

  let storageKey: string | null = null;

  switch (input.mediaScope) {
    case CMS_MEDIA_SCOPES.homepageHero:
      storageKey = await removeHomepageScalarImage("hero.image");
      break;
    case CMS_MEDIA_SCOPES.homepageAbout:
      storageKey = await removeHomepageScalarImage("about.image");
      break;
    case CMS_MEDIA_SCOPES.homepageProfessionals:
      storageKey = await removeHomepageScalarImage("professionals.image");
      break;
    case CMS_MEDIA_SCOPES.homepageCategory:
      storageKey = await removeHomepageArrayItemImage(
        "categories.items",
        input.itemId!,
      );
      break;
    case CMS_MEDIA_SCOPES.homepageInspiration:
      storageKey = await removeHomepageArrayItemImage(
        "inspiration.items",
        input.itemId!,
      );
      break;
    default:
      throw new CmsMediaMutationError(CMS_MEDIA_ERRORS.INVALID_SCOPE);
  }

  await deleteOldBlobBestEffort(storageKey);
}
