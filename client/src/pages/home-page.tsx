import Navbar from "@/components/navbar";
import CategoryNav from "@/components/category-nav";
import HeroBanner from "@/components/hero-banner";
import FeaturedProducts from "@/components/featured-products";
import PromoSection from "@/components/promo-section";
import CategoryShowcase from "@/components/category-showcase";
import DealsSection from "@/components/deals-section";
import Footer from "@/components/footer";
import CartSidebar from "@/components/cart-sidebar";
import { useCart } from "@/hooks/use-cart";

export default function HomePage() {
  const { isCartOpen } = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CategoryNav />
      <main className="flex-grow">
        <HeroBanner />
        <FeaturedProducts />
        <PromoSection />
        <CategoryShowcase />
        <DealsSection />
      </main>
      <Footer />
      {isCartOpen && <CartSidebar />}
    </div>
  );
}
