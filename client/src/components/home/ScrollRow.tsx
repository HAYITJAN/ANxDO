"use client";

import { useRef } from "react";

export function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dx: number) {
    ref.current?.scrollBy({ left: dx, behavior: "smooth" });
  }

  return (
    <div className="group/row relative -mx-1 pr-2 md:pr-12">
      <div
        ref={ref}
        className="-my-8 flex gap-3 overflow-x-auto overflow-y-visible py-8 pl-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scroll(360)}
        className="absolute right-0 top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#14121c]/95 text-xl text-white shadow-lg backdrop-blur-md transition hover:border-violet-500/40 hover:bg-[#1a1628] md:flex"
        aria-label="Keyingi"
      >
        ›
      </button>
    </div>
  );
}
