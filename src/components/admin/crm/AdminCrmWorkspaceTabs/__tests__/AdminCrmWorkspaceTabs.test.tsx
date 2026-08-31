import { describe, expect, it } from "vitest";
import AdminCrmWorkspaceTabs from "@/components/admin/crm/AdminCrmWorkspaceTabs/AdminCrmWorkspaceTabs";
import { renderToStaticMarkup } from "react-dom/server";

describe("AdminCrmWorkspaceTabs", () => {
  it("renders requests tab with pending count", () => {
    const html = renderToStaticMarkup(
      <AdminCrmWorkspaceTabs
        workspace="clients"
        activeTab="list"
        pendingRequestCount={3}
      />,
    );

    expect(html).toContain("כל הלקוחות");
    expect(html).toContain("בקשות (3)");
    expect(html).toContain('href="/admin/client-requests"');
  });

  it("marks requests tab active on request pages", () => {
    const html = renderToStaticMarkup(
      <AdminCrmWorkspaceTabs
        workspace="architects"
        activeTab="requests"
        pendingRequestCount={2}
      />,
    );

    expect(html).toContain("כל האדריכלים");
    expect(html).toContain("בקשות (2)");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/admin/architect-requests"');
  });
});
