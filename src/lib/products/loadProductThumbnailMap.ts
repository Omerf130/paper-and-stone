import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";

export type ProductThumbnailView = {
  url: string;
  altText: string;
};

export async function loadProductThumbnailMap(
  productIds: string[],
): Promise<Record<string, ProductThumbnailView>> {
  if (productIds.length === 0) {
    return {};
  }

  await connectDB();

  const objectIds = productIds
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  if (objectIds.length === 0) {
    return {};
  }

  const products = await Product.find({ _id: { $in: objectIds } })
    .select("media.primaryImage.url media.primaryImage.altText")
    .lean();

  const map: Record<string, ProductThumbnailView> = {};

  for (const product of products) {
    const url = product.media?.primaryImage?.url;

    if (!url) {
      continue;
    }

    map[product._id.toString()] = {
      url,
      altText: product.media?.primaryImage?.altText?.trim() ?? "",
    };
  }

  return map;
}
