import { promises as fs } from "node:fs";
import path from "node:path";

type TermsBlock =
  | { type: "title" | "meta" | "section" | "notice" | "paragraph"; text: string }
  | { type: "list"; items: string[] };

function parseTermsText(rawText: string): TermsBlock[] {
  const lines = rawText.replace(/\r/g, "").split("\n").map((line) => line.trim());
  const blocks: TermsBlock[] = [];

  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let currentListItem = "";

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" ").replace(/\s+/g, " ").trim(),
    });
    paragraphLines = [];
  };

  const flushListItem = () => {
    if (!currentListItem) return;
    listItems.push(currentListItem.replace(/\s+/g, " ").trim());
    currentListItem = "";
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({ type: "list", items: listItems });
    listItems = [];
  };

  const flushTextBlocks = () => {
    flushParagraph();
    flushListItem();
    flushList();
  };

  const isTitleLine = (line: string) =>
    line.toLowerCase().startsWith("end user terms and conditions");

  const isMetaLine = (line: string) =>
    line.startsWith("Last Updated:") || line.startsWith("Effective Date:");

  const isSectionLine = (line: string) => /^\d+\.\s+/.test(line);

  const isNoticeLine = (line: string) =>
    line === "PLEASE READ CAREFULLY" ||
    line.startsWith("IMPORTANT:") ||
    line.startsWith("IMPORTANT SAFETY NOTICE:");

  const isStandaloneLabelLine = (line: string) => /^[A-Za-z][A-Za-z\s/]+:\s/.test(line);

  const isTopLevelLine = (line: string) =>
    isTitleLine(line) || isMetaLine(line) || isSectionLine(line) || isNoticeLine(line);

  for (const line of lines) {
    if (!line) {
      flushTextBlocks();
      continue;
    }

    if (line.startsWith("●")) {
      flushParagraph();
      flushListItem();
      currentListItem = line.replace(/^●\s*/, "");
      continue;
    }

    if (currentListItem) {
      if (isTopLevelLine(line) || isStandaloneLabelLine(line)) {
        flushListItem();
        flushList();
      } else {
        currentListItem = `${currentListItem} ${line}`;
        continue;
      }
    }

    if (isTitleLine(line)) {
      flushTextBlocks();
      blocks.push({ type: "title", text: line });
      continue;
    }

    if (isMetaLine(line)) {
      flushTextBlocks();
      blocks.push({ type: "meta", text: line });
      continue;
    }

    if (isSectionLine(line)) {
      flushTextBlocks();
      blocks.push({ type: "section", text: line });
      continue;
    }

    if (isNoticeLine(line)) {
      flushTextBlocks();
      blocks.push({ type: "notice", text: line });
      continue;
    }

    paragraphLines.push(line);
  }

  flushTextBlocks();
  return blocks;
}

async function readTermsText(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "assets",
    "terms-and-conditions",
    "terms-and-conditions.txt"
  );

  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "Terms and Conditions are currently unavailable. Please try again later.";
  }
}

export default async function TermsAndConditionsPage() {
  const termsText = await readTermsText();
  const termsBlocks = parseTermsText(termsText);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-primary/30">
      <div className="fixed inset-0 pointer-events-none opacity-45">
        <div className="absolute left-[-24vw] top-[-8vw] h-[clamp(240px,48vw,620px)] w-[clamp(240px,48vw,620px)] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(97,37,216,0.55)_0%,transparent_70%)]" />
        <div className="absolute right-[-18vw] bottom-[-10vw] h-[clamp(220px,42vw,520px)] w-[clamp(220px,42vw,520px)] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(0,169,255,0.35)_0%,transparent_70%)]" />
      </div>

      <section className="relative z-10 container mx-auto max-w-5xl px-4 sm:px-6 md:px-10 pt-28 pb-16">
        <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
          Terms & Conditions
        </h1>
        <p className="mt-3 text-sm sm:text-base text-white/65 max-w-2xl">
          Please review these terms carefully before creating an account or starting a session.
        </p>

        <article className="mt-8 rounded-2xl border border-white/15 bg-white/3 p-5 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.35)] space-y-4 text-sm leading-relaxed text-white/80">
          {termsBlocks.map((block, index) => {
            if (block.type === "title") {
              return (
                <h2 key={`${block.type}-${index}`} className="text-lg font-semibold text-white">
                  {block.text}
                </h2>
              );
            }

            if (block.type === "meta") {
              return (
                <p key={`${block.type}-${index}`} className="text-sm font-medium text-white/70">
                  {block.text}
                </p>
              );
            }

            if (block.type === "section") {
              return (
                <h3 key={`${block.type}-${index}`} className="pt-2 text-base font-semibold text-white/95">
                  {block.text}
                </h3>
              );
            }

            if (block.type === "notice") {
              return (
                <p key={`${block.type}-${index}`} className="font-semibold uppercase tracking-wide text-amber-200/95">
                  {block.text}
                </p>
              );
            }

            if (block.type === "list") {
              return (
                <ul key={`${block.type}-${index}`} className="list-disc space-y-2 pl-5 marker:text-white/70">
                  {block.items.map((item, itemIndex) => (
                    <li key={`${index}-${itemIndex}`}>{item}</li>
                  ))}
                </ul>
              );
            }

            return <p key={`${block.type}-${index}`}>{block.text}</p>;
          })}
        </article>

      </section>
    </main>
  );
}
