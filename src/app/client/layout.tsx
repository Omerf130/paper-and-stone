import { requireClient } from "@/lib/auth/authorization";
import { clientNavItems } from "@/config/client-nav";
import { getClientWorkspaceContext } from "@/lib/client-projects/getClientWorkspaceContext";
import ClientShell from "@/components/client/ClientShell/ClientShell";
import ClientArchitectRequestBanner from "@/components/client/ClientArchitectRequestBanner/ClientArchitectRequestBanner";
import InternalUiProviders from "@/components/ui/InternalUiProviders";

export const dynamic = "force-dynamic";

export default async function ClientLayout({
  children,
}: LayoutProps<"/client">) {
  const user = await requireClient();
  const workspace = await getClientWorkspaceContext(user.id);

  return (
    <InternalUiProviders>
      <ClientShell navItems={clientNavItems}>
        {workspace.hasArchitectRequest ? (
          <ClientArchitectRequestBanner />
        ) : null}
        {children}
      </ClientShell>
    </InternalUiProviders>
  );
}
