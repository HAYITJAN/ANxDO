/**
 * ANDO — o‘rtadagi × belgisi "vs" (anime ↔ dorama) ni ifodalaydi.
 */
export function BrandWordmark({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const text =
    size === "sm" ? "text-sm" : size === "lg" ? "text-3xl md:text-4xl" : "text-lg md:text-xl";
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

/** Kichik kvadrat — o‘rtada × (logo belgisi) */
export function BrandIcon({ className = "" }: { className?: string }) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 text-xl font-light leading-none text-white shadow-lg shadow-fuchsia-900/40 sm:h-10 sm:w-10 ${className}`}
      aria-hidden
    >
      ×
    </span>
  );
}
