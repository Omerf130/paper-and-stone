"use client";

import { createContext, useContext } from "react";

type ProductFormActionsContextValue = {
  submit: () => void;
  isPending: boolean;
};

export const ProductFormActionsContext =
  createContext<ProductFormActionsContextValue | null>(null);

export function useProductFormActions() {
  return useContext(ProductFormActionsContext);
}
