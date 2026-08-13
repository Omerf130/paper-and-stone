import { requireProfessional } from "@/lib/auth/authorization";
import { ensureProfessionalProfile } from "@/lib/professionals/ensureProfessionalProfile";
import { professionalNavItems } from "@/config/professional-nav";
import { getUnreadNotificationCount } from "@/lib/notifications/notification-queries";
import ProfessionalShell from "@/components/professional/ProfessionalShell";
import InternalUiProviders from "@/components/ui/InternalUiProviders";

export default async function ProfessionalLayout({
  children,
}: LayoutProps<"/professional">) {
  const user = await requireProfessional();
  await ensureProfessionalProfile(user.id);

  const unreadNotificationCount = await getUnreadNotificationCount(user.id);
  const navItems = professionalNavItems.map((item) =>
    item.href === "/professional/notifications"
      ? { ...item, badgeCount: unreadNotificationCount }
      : item,
  );

  return (
    <InternalUiProviders>
      <ProfessionalShell
        unreadNotificationCount={unreadNotificationCount}
        navItems={navItems}
      >
        {children}
      </ProfessionalShell>
    </InternalUiProviders>
  );
}
