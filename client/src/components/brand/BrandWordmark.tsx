/**
 * ANDO — matnli belgida × "vs" (anime ↔ dorama) ni ifodalaydi.
 * Ikonkada — somon qaroqlar / jolly-roger (public/brand/jolly-roger.svg).
 */
import Image from "next/image";
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
      <span className="mx-0.5 font-semibold text-fuchsia-400" aria-hidden>
        ×
      </span>
      <span>DO</span>
    </span>
  );
}

/** Kichik kvadrat — bayroq uslubidagi jolly-roger (rasm) */
export function BrandIcon({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-lg shadow-fuchsia-900/40 sm:h-11 sm:w-11 ${className}`}
      aria-hidden
    >
      <Image
        src="/brand/jolly-roger.svg"
        alt=""
        width={44}
        height={44}
        className="h-[82%] w-[82%] object-contain drop-shadow-sm"
        priority
      />
    </span>
  );
}
