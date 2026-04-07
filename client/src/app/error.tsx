"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <h2 className="text-xl font-semibold text-white">Sahifa yuklanmadi</h2>
      <p className="mt-3 max-w-md text-sm text-zinc-400">
        {error.message || "Noma’lum xato. Internet yoki server (port 5000) ni tekshiring."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/35 transition hover:bg-accent-hover"
      >
        Qayta urinish
      </button>
    </div>
  );
}
