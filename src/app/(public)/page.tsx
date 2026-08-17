import AboutSection from "@/components/home/AboutSection/AboutSection";
import CategoriesSection from "@/components/home/CategoriesSection/CategoriesSection";
import ContactCtaSection from "@/components/home/ContactCtaSection/ContactCtaSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection/FeaturedProductsSection";
import HeroSection from "@/components/home/HeroSection/HeroSection";
import InspirationSection from "@/components/home/InspirationSection/InspirationSection";
import ProfessionalsSection from "@/components/home/ProfessionalsSection/ProfessionalsSection";
import ArchitectRequestBanner from "@/components/public/ArchitectRequestBanner/ArchitectRequestBanner";
import { buildVisibleHomepageSections } from "@/lib/cms/build-visible-homepage-sections";
import { getPublicHomepageContent } from "@/lib/cms/get-public-homepage-content";
import { getFeaturedProducts } from "@/lib/products/getFeaturedProducts";
import type { HomepageSectionKey } from "@/types/cms-content";

function renderHomepageSection(
  key: HomepageSectionKey,
  homepage: Awaited<ReturnType<typeof getPublicHomepageContent>>,
  featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>>,
) {
  switch (key) {
    case "hero":
      return <HeroSection key={key} content={homepage.hero} />;
    case "categories":
      return <CategoriesSection key={key} content={homepage.categories} />;
    case "featuredProducts":
      return (
        <FeaturedProductsSection
          key={key}
          content={homepage.featuredProducts}
          products={featuredProducts}
        />
      );
    case "about":
      return <AboutSection key={key} content={homepage.about} />;
    case "professionals":
      return <ProfessionalsSection key={key} content={homepage.professionals} />;
    case "inspiration":
      return <InspirationSection key={key} content={homepage.inspiration} />;
    case "closing":
      return <ContactCtaSection key={key} content={homepage.closing} />;
    default:
      return null;
  }
}

export default async function Home({
  searchParams,
}: PageProps<"/">) {
  const resolvedSearchParams = await searchParams;
  const registered = Array.isArray(resolvedSearchParams.registered)
    ? resolvedSearchParams.registered[0]
    : resolvedSearchParams.registered;
  const showArchitectRequestBanner = registered === "architect-request";

  const [homepage, featuredProducts] = await Promise.all([
    getPublicHomepageContent(),
    getFeaturedProducts(),
  ]);

  const visibleSections = buildVisibleHomepageSections(
    homepage,
    featuredProducts.length,
  );

  return (
    <>
      <ArchitectRequestBanner show={showArchitectRequestBanner} />
      {visibleSections.map((key) =>
        renderHomepageSection(key, homepage, featuredProducts),
      )}
    </>
  );
}
