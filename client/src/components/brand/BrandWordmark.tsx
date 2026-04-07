"use client";

import { useId } from "react";

/**
 * ANDO — matnli belgida × "vs" (anime ↔ dorama) ni ifodalaydi.
 * BrandIcon — inline SVG (tashqi fayl yo‘q, har doim chiziladi).
 */
export function BrandWordmark({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const text =
    size === "sm"
      ? "text-sm"
      : size === "lg"
        ? "text-3xl md:text-4xl"
        : "text-base sm:text-lg md:text-xl";
  return (
    <span
      className={`inline-flex items-baseline font-bold tracking-tight text-white ${text} ${className}`}
      aria-label="ANDO"
    >
      <span>AN</span>
      <span className="mx-0.5 font-semibold text-accent-hover" aria-hidden>
        ×
      </span>
      <span>DO</span>
    </span>
  );
}

/** Kichik kvadrat — jolly-roger (vektor, komponent ichida) */
export function BrandIcon({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const strawId = `${uid}-straw`;
  const skullId = `${uid}-skull`;

  return (
    <span
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent shadow-lg shadow-violet-950/45 ring-1 ring-violet-400/25 sm:h-11 sm:w-11 ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-[82%] w-[82%] shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id={strawId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f4e4bc" />
            <stop offset="100%" stopColor="#c9932a" />
          </linearGradient>
          <linearGradient id={skullId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffef8" />
            <stop offset="100%" stopColor="#e5ddd0" />
          </linearGradient>
        </defs>
        <g opacity={0.92}>
          <path stroke="#f3ead8" strokeWidth={5} strokeLinecap="round" d="M17 47 47 21" />
          <path stroke="#f3ead8" strokeWidth={5} strokeLinecap="round" d="M47 47 17 21" />
          <circle cx={17} cy={47} r={3.2} fill="#f3ead8" />
          <circle cx={47} cy={47} r={3.2} fill="#f3ead8" />
          <circle cx={47} cy={21} r={3.2} fill="#f3ead8" />
          <circle cx={17} cy={21} r={3.2} fill="#f3ead8" />
        </g>
        <path
          fill={`url(#${skullId})`}
          stroke="#9a8b7a"
          strokeWidth={0.55}
          strokeOpacity={0.45}
          d="M32 31c-10.5 0-14.5 7.5-14.5 15.2C17.5 54 24.5 60 32 60s14.5-6 14.5-13.8C46.5 38.5 42.5 31 32 31Z"
        />
        <ellipse cx={25} cy={44} rx={4.5} ry={5} fill="#15101f" />
        <ellipse cx={39} cy={44} rx={4.5} ry={5} fill="#15101f" />
        <circle cx={26} cy={43} r={1.2} fill="#2a2038" opacity={0.4} />
        <circle cx={40} cy={43} r={1.2} fill="#2a2038" opacity={0.4} />
        <path fill="#15101f" opacity={0.88} d="M32 47.5l-2.2 4.8h4.4l-2.2-4.8Z" />
        <path
          fill="none"
          stroke="#15101f"
          strokeWidth={1.15}
          strokeLinecap="round"
          d="M23.5 53.5q8.5 6.5 17 0"
        />
        <path
          stroke="#15101f"
          strokeWidth={0.85}
          opacity={0.45}
          d="M27 54v2.8m5-2.8v2.8m5-2.8v2.8"
        />
        <ellipse
          cx={32}
          cy={33}
          rx={27}
          ry={8.2}
          fill={`url(#${strawId})`}
          stroke="#9a6b2e"
          strokeWidth={0.45}
          strokeOpacity={0.55}
        />
        <ellipse cx={32} cy={31.5} rx={22} ry={5.5} fill="#f5ecd0" opacity={0.4} />
        <path
          fill={`url(#${strawId})`}
          stroke="#9a6b2e"
          strokeWidth={0.45}
          strokeOpacity={0.55}
          d="M15 31c2.5-12 11-17.5 17-17.5S47.5 19 49 31c-5.5-3.5-11.5-5.2-17-5.2S20.5 27.5 15 31Z"
        />
        <path
          fill="#c1121f"
          d="M13 28.5c7.5-1.8 13.5-2.5 19-2.5s11.5.7 19 2.5v4.2c-7.5-1.6-12.5-2-19-2s-11.5.4-19 2v-4.2Z"
        />
        <path fill="#7f1d1d" opacity={0.35} d="M13 31.2h38v1H13z" />
      </svg>
    </span>
  );
}
