import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import DashboardPreview from "@/components/landing/DashboardPreview";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ImpactSection from "@/components/landing/ImpactSection";
import CallToAction from "@/components/landing/CallToAction";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <HeroSection />
        <DashboardPreview />
        <HowItWorksSection />
        <FeaturesSection />
        <ImpactSection />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}