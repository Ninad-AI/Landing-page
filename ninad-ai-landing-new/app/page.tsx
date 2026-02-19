import Hero from "./components/Hero";
import Features from "./components/Features";
import Products from "./components/Products";
import UseCases from "./components/UseCases";
import Languages from "./components/Languages";
import Waitlist from "./components/Waitlist";

import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Hero />
      <Features />
      <Products />
      <Languages />
      <UseCases />
      <Waitlist />
      
      <Footer />
    </main>
  );
}
