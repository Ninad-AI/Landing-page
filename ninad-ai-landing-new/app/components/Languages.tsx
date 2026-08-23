import { Fragment } from "react";

const LANGUAGES = ["हिन्दी", "मराठी", "ગુજરાતી", "தமிழ்", "తెలుగు", "বাংলা", "ಕನ್ನಡ", "മലയാളം", "ਪੰਜਾਬੀ", "English"];
const REPEATED = [...LANGUAGES, ...LANGUAGES, ...LANGUAGES];

function LanguageRow({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex items-center gap-8 pr-8 flex-none" aria-hidden={hidden}>
      {REPEATED.map((lang, i) => (
        <Fragment key={i}>
          <span className="h-[3px] w-[3px] flex-none rounded-full bg-nd-dim" aria-hidden="true" />
          <span className="font-devanagari text-base leading-none text-nd-muted whitespace-nowrap">{lang}</span>
        </Fragment>
      ))}
    </div>
  );
}

export default function Languages() {
  return (
    <div className="relative border-y border-nd-line-soft bg-nd-panel py-4 overflow-hidden">
      <div className="flex w-max animate-nd-marquee">
        <LanguageRow />
        <LanguageRow hidden />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #F3EFE8 0%, rgba(243,239,232,0) 10%, rgba(243,239,232,0) 90%, #F3EFE8 100%)" }}
      />
    </div>
  );
}
