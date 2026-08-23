"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CreatorCard from "../components/CreatorCard";
import { CREATORS, CREATOR_CATEGORIES } from "../lib/creators-data";

export default function CreatorsPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CREATORS.filter((c) => {
      const matchesCategory = category === "All" || c.category === category;
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const handleTalk = (slug: string) => {
    router.push(`/creators/${slug}`);
  };

  return (
    <main className="relative min-h-screen bg-nd-bg selection:bg-nd-accent/20">
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20 md:pb-24">
        <div className={isVisible ? "animate-nd-up" : "opacity-0"}>
          <h1 className="font-display text-[42px] sm:text-[52px] md:text-[58px] leading-none tracking-tight text-nd-ink mb-2">
            Creators
          </h1>
          <p className="text-[15px] text-nd-dim mb-8">
            {visible.length} {visible.length === 1 ? "creator" : "creators"}
          </p>
        </div>

        <div className={`flex flex-wrap items-center gap-3.5 mb-9 ${isVisible ? "animate-nd-up" : "opacity-0"}`}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a name or a craft"
            className="w-full sm:w-80 px-4 py-3 rounded-[13px] border border-nd-line bg-nd-panel text-[14.5px] text-nd-ink placeholder:text-nd-dim outline-none focus:border-nd-accent transition-colors"
          />
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {["All", ...CREATOR_CATEGORIES].map((label) => {
              const active = category === label;
              return (
                <button
                  key={label}
                  onClick={() => setCategory(label)}
                  className={`flex-none px-4 py-2.5 rounded-full text-[13.5px] font-semibold border transition-colors cursor-pointer ${
                    active
                      ? "bg-nd-ink text-nd-bg border-nd-ink"
                      : "bg-white text-nd-muted border-nd-line hover:border-nd-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 ${isVisible ? "animate-nd-up" : "opacity-0"}`}>
          {visible.map((creator) => (
            <CreatorCard key={creator.slug} creator={creator} onClick={() => handleTalk(creator.slug)} />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="text-center text-nd-dim text-sm py-16">No creators match that search.</p>
        )}
      </div>
    </main>
  );
}
