"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/authorization";
import {
  removeWishlistItem,
  toggleWishlistItem,
} from "@/lib/wishlist/wishlist-queries";

export type WishlistActionResult = {
  error?: string;
  isWishlisted?: boolean;
};

export async function toggleProductWishlistAction(
  productSlug: string,
): Promise<WishlistActionResult> {
  const user = await requireUser();
  const normalizedSlug = productSlug.trim();

  if (!normalizedSlug) {
    return { error: "מוצר לא תקין" };
  }

  const result = await toggleWishlistItem(user.id, normalizedSlug);

  revalidatePath(`/products/${normalizedSlug}`);
  revalidatePath("/wishlist");

  return { isWishlisted: result.isWishlisted };
}

export async function removeProductFromWishlistAction(
  productSlug: string,
): Promise<WishlistActionResult> {
  const user = await requireUser();
  const normalizedSlug = productSlug.trim();

  if (!normalizedSlug) {
    return { error: "מוצר לא תקין" };
  }

  await removeWishlistItem(user.id, normalizedSlug);

  revalidatePath("/wishlist");
  revalidatePath(`/products/${normalizedSlug}`);

  return { isWishlisted: false };
}
