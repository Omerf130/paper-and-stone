"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { addProductFromCatalogContextAction } from "@/app/professional/projects/actions";
import { buildAddToProjectConfigurationView } from "@/lib/products/build-add-to-project-configuration-view";
import type { ProductConfiguratorState } from "@/lib/products/useProductConfiguratorState";
import type { ProductView } from "@/types/product";
import type { ProjectPickerOptionView } from "@/types/project";
import type { ArchitectCatalogProjectContextView } from "@/types/architect-catalog-context";

type UseProductAddActionsInput = {
  product: ProductView;
  state: ProductConfiguratorState;
  catalogContext?: ArchitectCatalogProjectContextView | null;
  isApprovedArchitect?: boolean;
  isClient?: boolean;
  projectOptions?: ProjectPickerOptionView[];
  profileReady?: boolean;
  loginHref?: string;
  registerHref?: string;
};

export function useProductAddActions({
  product,
  state,
  catalogContext = null,
  isApprovedArchitect = false,
  isClient = false,
  projectOptions = [],
  profileReady = false,
  loginHref,
  registerHref,
}: UseProductAddActionsInput) {
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [isContextPending, startContextTransition] = useTransition();
  const [contextError, setContextError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [successProjectHref, setSuccessProjectHref] = useState<string | undefined>();

  const {
    materialId,
    colorId,
    sizeId,
    quantity,
    isAddDialogOpen,
    setIsAddDialogOpen,
    currentMaterial,
    currentColor,
    currentSize,
    showSizeSelector,
    selectedImage,
    decreaseQuantity,
    increaseQuantity,
  } = state;

  const selection = {
    productSlug: product.slug,
    selectedMaterialId: materialId ?? undefined,
    selectedColorId: colorId ?? undefined,
    selectedSizeKey: sizeId ?? undefined,
    quantity,
  };

  const configuration = useMemo(
    () =>
      buildAddToProjectConfigurationView({
        product,
        material: currentMaterial,
        color: currentColor,
        sizeLabel: currentSize?.label ?? null,
        showSize: showSizeSelector,
        quantity,
        thumbnailUrl: selectedImage?.url ?? product.primaryImage?.url ?? null,
        thumbnailAlt: selectedImage?.alt ?? product.primaryImage?.alt ?? product.nameHe,
      }),
    [
      product,
      currentMaterial,
      currentColor,
      currentSize,
      showSizeSelector,
      quantity,
      selectedImage,
    ],
  );

  const handleContextualAdd = () => {
    if (!catalogContext || !profileReady) {
      return;
    }

    setContextError(undefined);
    startContextTransition(async () => {
      const result = await addProductFromCatalogContextAction({
        projectId: catalogContext.projectId,
        roomId: catalogContext.roomId,
        ...selection,
      });

      if (result?.error) {
        setContextError(result.error);
      }
    });
  };

  const handleOpenDialog = () => {
    setSuccessMessage(undefined);
    setSuccessProjectHref(undefined);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    addButtonRef.current?.focus();
  };

  const handleDialogSuccess = (payload: {
    projectId: string;
    projectName: string;
    roomId?: string;
    roomName?: string;
  }) => {
    const destination = payload.roomName
      ? `${payload.projectName} / ${payload.roomName}`
      : payload.projectName;

    setSuccessMessage(`המוצר נוסף לפרויקט: ${destination}.`);
    setSuccessProjectHref(
      payload.roomId
        ? `/professional/projects/${payload.projectId}?room=${payload.roomId}`
        : `/professional/projects/${payload.projectId}`,
    );
    addButtonRef.current?.focus();
  };

  const showAddSection = isApprovedArchitect || isClient || Boolean(loginHref);

  return {
    addButtonRef,
    selection,
    configuration,
    quantity,
    decreaseQuantity,
    increaseQuantity,
    isAddDialogOpen,
    isContextPending,
    contextError,
    successMessage,
    successProjectHref,
    showAddSection,
    isApprovedArchitect,
    isClient,
    catalogContext,
    profileReady,
    loginHref,
    registerHref,
    projectOptions,
    handleContextualAdd,
    handleOpenDialog,
    handleDialogClose,
    handleDialogSuccess,
  };
}

export type ProductAddActionsController = ReturnType<typeof useProductAddActions>;
