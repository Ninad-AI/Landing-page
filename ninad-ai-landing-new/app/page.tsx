import Hero from "./components/Hero";
import Features from "./components/Features";
// import Comparison from "./components/Comparison";
import Products from "./components/Products";
import UseCases from "./components/UseCases";
import Languages from "./components/Languages";
// import Pricing from "./components/Pricing";
import Waitlist from "./components/Waitlist";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Hero />
      <Features />
      {/* <Comparison /> */}
      <Products />
      <Languages />
      <UseCases />
      {/* <Pricing /> */}
      <Waitlist />
      <Footer />
    </main>
  );
}
