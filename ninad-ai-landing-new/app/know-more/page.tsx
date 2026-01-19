import Footer from "../components/Footer";
import KnowMoreHero from "./components/KnowMoreHero";
import WhatIsAIPersona from "./components/WhatIsAIPersona";
import HowItWorks from "./components/HowItWorks";
import ControlAndSafety from "./components/ControlAndSafety";
import WhyCreatorsLoveThis from "./components/WhyCreatorsLoveThis";

export default function KnowMorePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#080017]">
      <KnowMoreHero />
      <WhatIsAIPersona />
      <HowItWorks />
      <ControlAndSafety />
      <WhyCreatorsLoveThis />
      <Footer />
    </main>
  );
}
