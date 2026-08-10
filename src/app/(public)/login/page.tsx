import type { Metadata } from "next";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "התחברות | Paper & Stone",
  description: "התחברות לחשבון Paper & Stone",
};

export default function LoginPage() {
  return (
    <AuthPageLayout
      title="התחברות"
      description="היכנסו לחשבון שלכם כדי להמשיך."
    >
      <LoginForm />
    </AuthPageLayout>
  );
}
