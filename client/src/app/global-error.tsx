"use client";

import { BrandWordmark } from "@/components/brand/BrandWordmark";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="uz">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-violet-100">
        <h1 className="flex flex-wrap items-center justify-center gap-x-2 text-xl font-semibold">
          <BrandWordmark size="sm" />
          <span className="text-zinc-300">— xato</span>
        </h1>
        <p className="mt-3 max-w-md text-sm text-zinc-400">{error.message}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-xl border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/15"
        >
          Qayta yuklash
        </button>
      </body>
    </html>
  );
}
