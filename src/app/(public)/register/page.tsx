import type { Metadata } from "next";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "הרשמה | Paper & Stone",
  description: "יצירת חשבון Paper & Stone",
};

export default function RegisterPage() {
  return (
    <AuthPageLayout
      title="הרשמה"
      description="צרו חשבון כדי להתחיל לעבוד עם Paper & Stone."
    >
      <RegisterForm />
    </AuthPageLayout>
  );
}
