"use client";

import { AD_INQUIRY_HREF } from "@/lib/ads";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";

function AdInquiryLink({
  href,
  className,
  style,
  tabIndex,
  "aria-label": ariaLabel,
  children,
}: {
  href: string;
  className?: string;
  style?: CSSProperties;
  tabIndex?: number;
  "aria-label"?: string;
  children: ReactNode;
}) {
  const internal = href.startsWith("/") && !href.startsWith("//");
  if (internal) {
    return (
      <Link href={href} className={className} style={style} tabIndex={tabIndex} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  const newTab = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      className={className}
      style={style}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" as const } : {})}
    >
      {children}
    </a>
  );
}

export const AD_PLACEHOLDER_PHRASES = [
  "Bu yerda sizning reklamangiz bo‘lishi mumkin edi",
  "Banner va video — auditoriyangizni biz bilan toping",
  "Reklama joylash uchun ma’muriyat bilan bog‘laning",
  "Sizning brendingiz — ANDO foydalanuvchilari oldida",
];

/** Pastki lenta — faqat bu jumlani takrorlaydi */
const FOOTER_MARQUEE_TEXT = AD_PLACEHOLDER_PHRASES[0]!;

type MarqueeProps = {
  phrases: string[];
  variant?: "footer" | "inset";
  docked?: boolean;
};

export function MarqueeStrip({ phrases, variant = "inset", docked }: MarqueeProps) {
  const loopInset = [...phrases, ...phrases];
  const isFooter = variant === "footer";
  const footerLoop = Array.from({ length: 24 }, () => FOOTER_MARQUEE_TEXT);

  if (!isFooter) {
    return (
      <div className="mb-5 overflow-hidden rounded-xl border border-fuchsia-500/25 bg-gradient-to-r from-black/80 via-fuchsia-950/30 to-black/80 py-3 shadow-inner shadow-fuchsia-900/20" aria-hidden>
        <div className="flex w-max max-w-none animate-ad-marquee will-change-transform">
          {loopInset.map((p, idx) => (
            <span key={idx} className="shrink-0 px-6 text-[12px] font-medium tracking-tight text-zinc-300 sm:px-8 sm:text-sm">
              {p}
              <span className="mx-3 inline-block text-fuchsia-500/50 sm:mx-4">·</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "w-full overflow-hidden rounded-none border-x-0 border-t-0 border-b-0 transition-[box-shadow] duration-300",
        docked
          ? "bg-transparent shadow-[inset_0_1px_0_0_rgba(192,132,252,0.08)] motion-safe:animate-ad-dock-glow"
          : "bg-[#050308]/95",
      ].join(" ")}
    >
      <div className="relative w-full overflow-hidden border-b border-fuchsia-500/10 bg-black/50 py-1 sm:py-1.5">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-950/40 via-fuchsia-950/25 to-violet-950/40 motion-safe:animate-ad-shimmer bg-[length:200%_100%] opacity-60"
          aria-hidden
        />
        <div
          className="relative flex w-max max-w-none animate-ad-marquee will-change-transform [perspective:640px] [transform-style:preserve-3d]"
        >
          {footerLoop.map((p, idx) => (
            <span key={idx} className="shrink-0 px-4 sm:px-5 [transform-style:preserve-3d]">
              <AdInquiryLink
                href={AD_INQUIRY_HREF}
                tabIndex={idx === 0 ? 0 : -1}
                aria-label={idx === 0 ? "Reklama joylashtirish bo‘yicha bog‘lanish" : undefined}
                className="relative inline-flex cursor-pointer items-center gap-2 outline-none ring-fuchsia-400/50 transition hover:opacity-95 focus-visible:rounded-sm focus-visible:ring-2 motion-safe:animate-ad-3d-marquee-text motion-reduce:animate-none"
                style={{ animationDelay: `${(idx % 8) * 75}ms` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- statik lokal SVG */}
                <img
                  src="/ads/straw-hat-jolly-roger.svg"
                  alt=""
                  width={26}
                  height={26}
                  className="h-[1.25rem] w-[1.25rem] shrink-0 self-center drop-shadow-[0_0_6px_rgba(167,139,250,0.5)] sm:h-7 sm:w-7"
                  aria-hidden
                />
                <span
                  className="inline-block bg-gradient-to-b from-white via-fuchsia-50 to-violet-500 bg-[length:220%_160%] bg-clip-text text-[11px] font-black uppercase leading-tight tracking-[0.14em] text-transparent motion-safe:animate-ad-3d-marquee-shine motion-reduce:animate-none sm:text-xs sm:tracking-[0.17em]"
                  style={{ animationDelay: `${(idx % 8) * 75 + 120}ms` }}
                >
                  {p}
                </span>
              </AdInquiryLink>
              <span
                className="mx-3 inline-block text-[12px] font-black text-fuchsia-200/95 sm:mx-4 sm:text-sm"
                style={{
                  textShadow:
                    "0 1px 0 #c084fc, 0 2px 0 #9333ea, 0 3px 0 #6b21a8, 0 4px 12px rgba(0,0,0,0.88)",
                }}
                aria-hidden
              >
                ·
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

type Props = {
  placement?: "default" | "footer";
  className?: string;
  docked?: boolean;
};

export function HomeAdPlaceholders({ placement = "default", className, docked }: Props) {
  const [i, setI] = useState(0);
  const isFooter = placement === "footer";

  useEffect(() => {
    if (placement === "footer") return;
    const t = setInterval(() => {
      setI((x) => (x + 1) % AD_PLACEHOLDER_PHRASES.length);
    }, 3200);
    return () => clearInterval(t);
  }, [placement]);

  const sectionClass =
    className !== undefined
      ? className
      : isFooter
        ? ""
        : "mt-10 border-t border-white/[0.06] pt-10";

  const phraseIndex = i % AD_PLACEHOLDER_PHRASES.length;
  const cards = (
    <div className="w-full">
      <div className="group relative min-w-0 overflow-hidden rounded-2xl bg-zinc-950/90 shadow-lg shadow-black/40 ring-1 ring-fuchsia-500/20">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-fuchsia-600/12 via-violet-600/18 to-fuchsia-600/12 bg-[length:200%_100%] animate-ad-shimmer"
          aria-hidden
        />
        <div className="relative flex min-h-[88px] flex-col items-center justify-center px-4 py-5">
          <p
            key={phraseIndex}
            className="w-full text-balance text-center text-[13px] font-medium leading-relaxed text-zinc-200 motion-safe:animate-ad-fade sm:text-sm"
          >
            {AD_PLACEHOLDER_PHRASES[phraseIndex]}
          </p>
        </div>
      </div>
    </div>
  );

  const defaultBlock = (
    <>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Reklama</p>
      {cards}
      <p className="mt-5 text-center text-[11px] text-zinc-600">
        Reklama materiallari sayt ma’muriyati orqali joylashtiriladi.
      </p>
    </>
  );

  return (
    <section className={sectionClass} aria-label="Partnerlar">
      {isFooter ? (
        <MarqueeStrip phrases={AD_PLACEHOLDER_PHRASES} variant="footer" docked={docked} />
      ) : (
        <div className="px-0">{defaultBlock}</div>
      )}
    </section>
  );
}
