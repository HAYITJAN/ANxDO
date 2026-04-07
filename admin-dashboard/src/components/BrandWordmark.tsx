/** ANDO — o‘rtadagi × "vs" (anime ↔ dorama) */
export function BrandWordmark({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const text = size === "sm" ? "text-sm" : "text-sm font-semibold tracking-tight";
  return (
    <span className={`inline-flex items-baseline text-white ${text} ${className}`} aria-label="ANDO">
      <span>AN</span>
      <span className="mx-0.5 font-semibold text-fuchsia-400" aria-hidden>
        ×
      </span>
      <span>DO</span>
    </span>
  );
}

export function BrandIcon({ className = "" }: { className?: string }) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-violet-600 text-xl font-light leading-none text-white shadow-lg ${className}`}
      aria-hidden
    >
      ×
    </span>
  );
}
