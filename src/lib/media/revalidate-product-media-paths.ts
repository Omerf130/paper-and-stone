import { revalidatePath } from "next/cache";

export async function revalidateProductMediaPaths(slug: string | null): Promise<void> {
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}
