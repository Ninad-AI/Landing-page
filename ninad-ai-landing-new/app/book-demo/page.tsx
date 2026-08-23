import BookDemoForm from "./BookDemoForm";

export const metadata = {
  title: "Book a Demo | Ninad AI",
  description: "Schedule a demo of Ninad AI Voice.",
};

export default function BookDemoPage() {
  return (
    <main className="relative min-h-screen w-full bg-nd-bg overflow-hidden">
      <section className="relative w-full min-h-screen pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-20 flex items-center justify-center">
        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-14 items-center">
              <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
                <p className="text-nd-accent font-nd-sans text-sm font-bold tracking-widest uppercase">
                  Book a demo
                </p>
                <h1 className="mt-3 font-display text-[clamp(40px,6vw,64px)] leading-[0.98] tracking-tight text-nd-ink">
                  See Ninad AI Voice in action
                </h1>
                <p className="mt-5 text-nd-muted font-nd-sans text-base md:text-lg leading-relaxed">
                  Tell us a bit about your use case and we&apos;ll reach out to schedule a live demo.
                </p>
              </div>

              <div className="w-full max-w-2xl mx-auto lg:mx-0 lg:max-w-none">
                <BookDemoForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
