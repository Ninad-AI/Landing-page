export const DEFAULT_PREFERRED_PROVIDER = "deepgram";

export interface CreatorEntry {
  slug: string;
  name: string;
  role: string;
  image: string;
  influencerId: string;
  preferredProvider: string;
  category: string;
  status: "LIVE";
  // Existing, already-published copy only — no bio is invented for a
  // creator that doesn't already have one.
  bio?: string;
}

// Single source of truth for creator data, shared by the listing page, the
// creator detail page, and the voice-chat page (previously three
// independent, inconsistently-shaped hardcoded copies).
export const CREATORS: CreatorEntry[] = [
  {
    slug: "nirupam",
    name: "Nirupam Paritala",
    role: "Actor & Producer",
    image: "/assets/creators/nirupam.jpeg",
    influencerId: "nirupam",
    preferredProvider: DEFAULT_PREFERRED_PROVIDER,
    category: "Film",
    status: "LIVE",
    bio: "Acclaimed actor and producer known for his powerful performances and creative vision.",
  },
  {
    slug: "aneri-thakkar",
    name: "Aneri Thakkar",
    role: "Coach & Influencer",
    image: "/assets/creators/aneri-2.jpg",
    influencerId: "aneri",
    preferredProvider: DEFAULT_PREFERRED_PROVIDER,
    category: "Coaching",
    status: "LIVE",
    bio: "Captivating audiences with her stellar performances and magnetic screen presence.",
  },
  // NOTE: Anveshi Jain temporarily removed from the frontend. Uncomment to re-enable.
  // {
  //   slug: "anveshi-jain",
  //   name: "Anveshi Jain",
  //   role: "Actress & Influencer",
  //   image: "/assets/creators/anveshi.jpg",
  //   influencerId: "anveshi_jain",
  //   preferredProvider: DEFAULT_PREFERRED_PROVIDER,
  //   category: "Film",
  //   status: "LIVE",
  // },
  // NOTE: Beauty Khan temporarily removed from the frontend. Uncomment to re-enable.
  // {
  //   slug: "beauty-khan",
  //   name: "Beauty Khan",
  //   role: "Artist and Creator",
  //   image: "/assets/creators/beauty-khan.jpg",
  //   influencerId: "beauty_khan",
  //   preferredProvider: DEFAULT_PREFERRED_PROVIDER,
  //   category: "Art",
  //   status: "LIVE",
  // },
  {
    slug: "sona-dey",
    name: "Sona Dey",
    role: "Model & Influencer",
    image: "/assets/creators/sona.png",
    influencerId: "sona_dey",
    preferredProvider: DEFAULT_PREFERRED_PROVIDER,
    category: "Modeling",
    status: "LIVE",
    bio: "A model and influencer known for bold, expressive visuals and a magnetic presence.",
  },
];

const CREATORS_BY_SLUG: Record<string, CreatorEntry> = Object.fromEntries(
  CREATORS.map((c) => [c.slug, c])
);

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Matches the fallback behavior the three call sites already relied on for
// an unrecognized slug: derive a display name/image instead of throwing.
export function getCreatorBySlug(slug: string): CreatorEntry {
  return (
    CREATORS_BY_SLUG[slug] ?? {
      slug,
      name: humanizeSlug(slug),
      role: "Creator",
      image: `/assets/creators/${slug}.png`,
      influencerId: "",
      preferredProvider: DEFAULT_PREFERRED_PROVIDER,
      category: "Other",
      status: "LIVE",
    }
  );
}

export const CREATOR_CATEGORIES: string[] = Array.from(
  new Set(CREATORS.map((c) => c.category))
);
