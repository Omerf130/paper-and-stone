"use client";

import { useCallback, useMemo, useState } from "react";
import {
  getColorById,
  getConfiguratorState,
  getMaterialById,
  resolveValidColorId,
} from "@/lib/products/configurator-helpers";
import { shouldShowSizeSelector } from "@/lib/products/get-product-page-sections";
import { hasProductDimensions } from "@/lib/products/product-display-helpers";
import { shouldShowRecolorForImage } from "@/lib/recolor/recolor-configurator-helpers";
import type { PublicImageView } from "@/types/product-media";
import type { ProductView } from "@/types/product";

export type ViewMode = "product" | "drawing";

export const MAX_PRODUCT_QUANTITY = 999;

export function buildProductImages(product: ProductView): PublicImageView[] {
  const images: PublicImageView[] = [];

  if (product.primaryImage) {
    images.push(product.primaryImage);
  }

  for (const image of product.gallery) {
    if (!images.some((existing) => existing.url === image.url)) {
      images.push(image);
    }
  }

  return images;
}

export function useProductConfiguratorState(product: ProductView) {
  const initialState = useMemo(
    () => getConfiguratorState(product),
    [product],
  );
  const canShowDrawing =
    Boolean(product.technicalDrawing) || hasProductDimensions(product.dimensions);
  const productImages = useMemo(() => buildProductImages(product), [product]);
  const showSizeSelector = shouldShowSizeSelector(product.sizes.length);

  const [view, setView] = useState<ViewMode>("product");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    product.primaryImage?.url ?? productImages[0]?.url ?? null,
  );
  const [materialId, setMaterialId] = useState<string | null>(
    initialState.materialId,
  );
  const [colorId, setColorId] = useState<string | null>(initialState.colorId);
  const [sizeId, setSizeId] = useState<string | null>(initialState.sizeId);
  const [quantity, setQuantity] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const currentMaterial = useMemo(() => {
    if (!materialId) {
      return null;
    }

    return getMaterialById(product, materialId) ?? null;
  }, [product, materialId]);

  const currentColor = useMemo(() => {
    if (!currentMaterial || !colorId) {
      return null;
    }

    return getColorById(currentMaterial, colorId) ?? null;
  }, [currentMaterial, colorId]);

  const currentSize = useMemo(() => {
    if (!sizeId) {
      return null;
    }

    return product.sizes.find((size) => size.id === sizeId) ?? null;
  }, [product, sizeId]);

  const selectedImage = useMemo(() => {
    if (!selectedImageUrl) {
      return product.primaryImage;
    }

    return (
      productImages.find((image) => image.url === selectedImageUrl) ??
      product.primaryImage
    );
  }, [product.primaryImage, productImages, selectedImageUrl]);

  const showRecolor = shouldShowRecolorForImage(
    product,
    selectedImageUrl,
    currentColor?.hex,
  );

  const handleMaterialChange = useCallback(
    (newMaterialId: string) => {
      const material = getMaterialById(product, newMaterialId);
      if (!material) {
        return;
      }

      setMaterialId(newMaterialId);
      setColorId((previousColorId) =>
        previousColorId
          ? resolveValidColorId(material, previousColorId)
          : (material.colors[0]?.id ?? null),
      );
    },
    [product],
  );

  const decreaseQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const increaseQuantity = useCallback(() => {
    setQuantity((prev) => Math.min(MAX_PRODUCT_QUANTITY, prev + 1));
  }, []);

  return {
    initialState,
    canShowDrawing,
    productImages,
    showSizeSelector,
    view,
    setView,
    selectedImageUrl,
    setSelectedImageUrl,
    materialId,
    colorId,
    setColorId,
    sizeId,
    setSizeId,
    quantity,
    isAddDialogOpen,
    setIsAddDialogOpen,
    currentMaterial,
    currentColor,
    currentSize,
    selectedImage,
    showRecolor,
    handleMaterialChange,
    decreaseQuantity,
    increaseQuantity,
  };
}

export type ProductConfiguratorState = ReturnType<
  typeof useProductConfiguratorState
>;
