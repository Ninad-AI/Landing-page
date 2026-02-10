import React from "react";
import Image from "next/image";

interface Creator {
    id: number;
    name: string;
    imageUrl: string;
}

const CREATORS: Creator[] = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Creator ${i + 1}`,
    imageUrl: `https://i.pravatar.cc/300?u=${i + 1}`,
}));

export default function CreatorsPage() {
    return (
        <main className="min-h-screen bg-black text-white pt-32 pb-20">
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans text-center">
                    Our <span className="text-primary">Creators</span>
                </h1>
                <p className="text-white/60 text-center max-w-2xl mx-auto mb-16 text-lg">
                    Meet the brilliant minds behind the magic.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {CREATORS.map((creator) => (
                        <div
                            key={creator.id}
                            className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300"
                        >
                            <div className="relative aspect-square w-full">
                                <Image
                                    src={creator.imageUrl}
                                    alt={creator.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                            </div>
                            <div className="p-6 absolute bottom-0 left-0 w-full">
                                <h3 className="text-xl font-bold font-sans text-white group-hover:text-primary transition-colors">
                                    {creator.name}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
