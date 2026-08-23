import type { Metadata } from "next";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import { resolveSafeNextUrl } from "@/lib/auth/safe-next-url";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "התחברות | Paper & Stone",
  description: "התחברות לחשבון Paper & Stone",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const next = resolveSafeNextUrl(
    typeof resolvedSearchParams.next === "string"
      ? resolvedSearchParams.next
      : resolvedSearchParams.next?.[0],
  );

  return (
    <AuthPageLayout
      title="התחברות"
      description="היכנסו לחשבון שלכם כדי להמשיך."
    >
      <LoginForm next={next} />
    </AuthPageLayout>
  );
}
