"use client";

import { ToastProvider } from "@/components/ui/Toast/ToastProvider";

type InternalUiProvidersProps = {
  children: React.ReactNode;
};

export default function InternalUiProviders({
  children,
}: InternalUiProvidersProps) {
  return <ToastProvider>{children}</ToastProvider>;
}
