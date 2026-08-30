import { redirect } from "next/navigation";

export default function AdminColorsRedirectPage() {
  redirect("/admin/materials");
}
