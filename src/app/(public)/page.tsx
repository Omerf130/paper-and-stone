import AboutSection from "@/components/home/AboutSection/AboutSection";
import CategoriesSection from "@/components/home/CategoriesSection/CategoriesSection";
import ContactCtaSection from "@/components/home/ContactCtaSection/ContactCtaSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection/FeaturedProductsSection";
import HeroSection from "@/components/home/HeroSection/HeroSection";
import InspirationSection from "@/components/home/InspirationSection/InspirationSection";
import ProfessionalsSection from "@/components/home/ProfessionalsSection/ProfessionalsSection";
import { getFeaturedProducts } from "@/lib/products/getFeaturedProducts";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <HeroSection />
      <CategoriesSection />
      {featuredProducts.length > 0 ? (
        <FeaturedProductsSection products={featuredProducts} />
      ) : null}
      <AboutSection />
      <ProfessionalsSection />
      <InspirationSection />
      <ContactCtaSection />
    </>
  );
}
