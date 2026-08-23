import Hero from "./components/Hero";
import Languages from "./components/Languages";
import Products from "./components/Products";
import Features from "./components/Features";
import Safety from "./components/Safety";
import UseCases from "./components/UseCases";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-nd-bg">
      <Hero />
      <Languages />
      <Products />
      <Features />
      <Safety />
      <UseCases />
      <Footer />
    </main>
  );
}
