import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import GamificationSection from "@/components/GamificationSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import HomeLoggedIn from "@/components/home/HomeLoggedIn";

const Index = () => {
  const { user, loading } = useAuth();

  // Show logged-in home for authenticated users
  if (!loading && user) {
    return <HomeLoggedIn />;
  }

  // Show landing page for visitors
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <GamificationSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
