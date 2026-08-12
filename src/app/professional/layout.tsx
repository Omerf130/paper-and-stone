import { requireProfessional } from "@/lib/auth/authorization";
import { ensureProfessionalProfile } from "@/lib/professionals/ensureProfessionalProfile";
import ProfessionalShell from "@/components/professional/ProfessionalShell";

export default async function ProfessionalLayout({
  children,
}: LayoutProps<"/professional">) {
  const user = await requireProfessional();
  await ensureProfessionalProfile(user.id);

  return <ProfessionalShell>{children}</ProfessionalShell>;
}
