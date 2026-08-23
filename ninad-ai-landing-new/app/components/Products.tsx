"use client";

import { useRouter } from "next/navigation";
import CreatorCard from "./CreatorCard";
import { CREATORS } from "../lib/creators-data";

export default function Products() {
  const router = useRouter();
  const featured = CREATORS.slice(0, 5);

  return (
    <section id="products" className="bg-nd-bg">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-nd-ink">Live right now</h2>
          <button
            onClick={() => router.push("/creators")}
            className="text-sm font-bold text-nd-accent hover:text-nd-accent-dark transition-colors cursor-pointer"
          >
            All creators →
          </button>
        </div>
        <div
          className="flex gap-4 overflow-x-auto -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-5 sm:overflow-visible"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {featured.map((creator) => (
            <div key={creator.slug} className="flex-none w-[152px] sm:w-auto" style={{ scrollSnapAlign: "start" }}>
              <CreatorCard creator={creator} onClick={() => router.push(`/creators/${creator.slug}`)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
