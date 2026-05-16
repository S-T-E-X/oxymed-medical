import FeatureBar from "../components/home/FeatureBar";
import Hero from "../components/home/Hero";
import ProductGroups from "../components/home/ProductGroups";
import References from "../components/home/References";
import StatsSection from "../components/home/StatsSection";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-oxynavy-950">
      <Header />
      <main>
        <Hero />
        <FeatureBar />
        <ProductGroups />
        <StatsSection />
        <References />
      </main>
      <Footer />
    </div>
  );
}
