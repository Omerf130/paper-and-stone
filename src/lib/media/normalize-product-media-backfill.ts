import { put } from "@vercel/blob";
import { connectDB } from "@/lib/db/mongoose";
import { buildStoragePath } from "@/lib/media/build-storage-path";
import { deleteOldBlobBestEffort } from "@/lib/media/product-media-mutations";
import {
  shouldNormalizeMediaSlot,
  shouldNormalizeMediaType,
} from "@/lib/media/normalization-policy";
import { normalizeProductImageBuffer } from "@/lib/media/normalize-product-image";
import Product, { type IProductMediaItem } from "@/models/Product";

export type BackfillMediaTarget = "primary" | "gallery";

export type BackfillMediaItemReport = {
  productSlug: string;
  slot: BackfillMediaTarget;
  mediaItemId: string;
  originalFilename: string;
  url: string;
  action: "skip" | "normalize";
  reason: string;
  currentWidth?: number;
  currentHeight?: number;
  nextWidth?: number;
  nextHeight?: number;
};

export type BackfillMediaReport = {
  dryRun: boolean;
  productSlug: string;
  items: BackfillMediaItemReport[];
};

type BackfillOptions = {
  productSlug: string;
  dryRun: boolean;
  slots?: BackfillMediaTarget[];
};

function collectTargets(
  product: NonNullable<Awaited<ReturnType<typeof findProductBySlug>>>,
  slots: BackfillMediaTarget[],
): Array<{ slot: BackfillMediaTarget; item: IProductMediaItem }> {
  const targets: Array<{ slot: BackfillMediaTarget; item: IProductMediaItem }> =
    [];

  if (slots.includes("primary") && product.media?.primaryImage) {
    targets.push({ slot: "primary", item: product.media.primaryImage });
  }

  if (slots.includes("gallery")) {
    for (const item of product.media?.gallery ?? []) {
      targets.push({ slot: "gallery", item });
    }
  }

  return targets;
}

async function findProductBySlug(slug: string) {
  await connectDB();
  return Product.findOne({ slug });
}

async function downloadImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function backfillProductMediaNormalization(
  options: BackfillOptions,
): Promise<BackfillMediaReport> {
  const slots = options.slots ?? ["primary", "gallery"];
  const product = await findProductBySlug(options.productSlug);

  if (!product) {
    throw new Error(`Product not found for slug: ${options.productSlug}`);
  }

  const report: BackfillMediaReport = {
    dryRun: options.dryRun,
    productSlug: options.productSlug,
    items: [],
  };

  for (const target of collectTargets(product, slots)) {
    const { slot, item } = target;

    if (!shouldNormalizeMediaSlot(slot) || !shouldNormalizeMediaType(item.mediaType)) {
      report.items.push({
        productSlug: options.productSlug,
        slot,
        mediaItemId: item._id.toString(),
        originalFilename: item.originalFilename,
        url: item.url,
        action: "skip",
        reason: "policy_excluded",
        currentWidth: item.width,
        currentHeight: item.height,
      });
      continue;
    }

    const sourceBuffer = await downloadImageBuffer(item.url);
    const normalized = await normalizeProductImageBuffer(sourceBuffer, {
      alreadyNormalized: item.normalized === true,
    });

    if (normalized.skipped) {
      report.items.push({
        productSlug: options.productSlug,
        slot,
        mediaItemId: item._id.toString(),
        originalFilename: item.originalFilename,
        url: item.url,
        action: "skip",
        reason: normalized.reason,
        currentWidth: item.width ?? normalized.width,
        currentHeight: item.height ?? normalized.height,
      });
      continue;
    }

    report.items.push({
      productSlug: options.productSlug,
      slot,
      mediaItemId: item._id.toString(),
      originalFilename: item.originalFilename,
      url: item.url,
      action: "normalize",
      reason: normalized.reason,
      currentWidth: item.width,
      currentHeight: item.height,
      nextWidth: normalized.width,
      nextHeight: normalized.height,
    });

    if (options.dryRun) {
      continue;
    }

    const pathname = buildStoragePath(
      product._id.toString(),
      slot,
      item.originalFilename.replace(/\.[^.]+$/, "-normalized.jpg"),
    );

    const uploaded = await put(pathname, normalized.buffer, {
      access: "public",
      contentType: normalized.mimeType,
      addRandomSuffix: true,
    });

    const oldStorageKey = item.storageKey;

    item.storageKey = uploaded.pathname;
    item.url = uploaded.url;
    item.byteSize = normalized.buffer.byteLength;
    item.width = normalized.width;
    item.height = normalized.height;
    item.normalized = true;
    item.mimeType = normalized.mimeType;

    product.markModified("media");
    await product.save();
    await deleteOldBlobBestEffort(oldStorageKey);
  }

  return report;
}
