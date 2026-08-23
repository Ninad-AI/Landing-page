"use client";

import Image from "next/image";
import type { CreatorEntry } from "../lib/creators-data";

interface CreatorCardProps {
  creator: CreatorEntry;
  onClick: () => void;
}

export default function CreatorCard({ creator, onClick }: CreatorCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="relative w-full aspect-[4/5] rounded-[18px] overflow-hidden bg-nd-tint mb-3">
        <Image
          src={creator.image}
          alt={creator.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute left-[9px] top-[9px] flex items-center gap-1.5 rounded-full bg-nd-bg/92 px-2.5 py-1 pointer-events-none">
          <span className="w-[5px] h-[5px] rounded-full bg-[#5F7A63]" />
          <span className="text-[9.5px] font-extrabold tracking-wide text-nd-ink">
            {creator.status}
          </span>
        </div>
      </div>
      <div className="text-[15px] font-bold text-nd-ink tracking-tight">{creator.name}</div>
      <div className="text-[12.5px] text-nd-dim mt-0.5">{creator.role}</div>
    </div>
  );
}
