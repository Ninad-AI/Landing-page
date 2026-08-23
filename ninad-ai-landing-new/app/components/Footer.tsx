import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-nd-panel border-t border-nd-line">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 py-12 sm:py-14 flex flex-wrap justify-between gap-12">
        <div>
          <div className="relative w-36 h-5">
            <Image src="/assets/ninad-ai.png" alt="Ninad AI" fill sizes="144px" className="object-contain object-left" />
          </div>
          <p className="text-[13px] leading-relaxed text-nd-dim mt-3.5 max-w-[300px]">
            Voice personas, licensed and operated end to end. Made in Bengaluru.
          </p>
        </div>
        <div className="flex flex-wrap gap-14">
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-extrabold tracking-[0.12em] text-nd-dim uppercase">Product</span>
            <Link href="/creators" className="text-[13.5px] font-semibold text-nd-muted hover:text-nd-ink transition-colors">Creators</Link>
            <Link href="/for-creators" className="text-[13.5px] font-semibold text-nd-muted hover:text-nd-ink transition-colors">For creators</Link>
            <Link href="/#safety" className="text-[13.5px] font-semibold text-nd-muted hover:text-nd-ink transition-colors">Safety</Link>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-extrabold tracking-[0.12em] text-nd-dim uppercase">Company</span>
            <a href="mailto:ninad.company@gmail.com" className="text-[13.5px] font-semibold text-nd-muted hover:text-nd-ink transition-colors">
              ninad.company@gmail.com
            </a>
            <Link href="/terms-and-conditions" className="text-[13.5px] font-semibold text-nd-muted hover:text-nd-ink transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="text-[13.5px] font-semibold text-nd-dim">© 2025 Ninad AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
