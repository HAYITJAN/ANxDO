import type { AdItem } from "@/lib/ads";
import { AdMedia } from "@/components/home/AdMedia";
import { HomeAdPlaceholders } from "@/components/home/HomeAdPlaceholders";

type Placement = "default" | "footer";

export function HomeAdsSection({
  ads,
  placement = "default",
  docked = false,
}: {
  ads: AdItem[];
  /** footer — bosh sahifada pastki qism (sticky emas) */
  placement?: Placement;
  /** Skroll bilan ekran pastiga qotgan */
  docked?: boolean;
}) {
  const shell =
    placement === "footer"
      ? ""
      : "mt-10 border-t border-white/[0.06] pt-10";

  if (!ads.length) {
    return <HomeAdPlaceholders placement={placement} className={shell} docked={docked} />;
  }

  const isFooter = placement === "footer";

  return (
    <section className={shell} aria-label="Partnerlar">
      <div className={isFooter ? "px-3 sm:px-5" : ""}>
        {!isFooter ? (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Reklama</p>
        ) : null}
        <div
          className={`grid w-full ${
            isFooter ? "grid-cols-1 gap-5" : "gap-6 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {ads.map((ad) => {
            const inner = (
              <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-900/50 ring-1 ring-violet-500/10 shadow-lg shadow-black/40">
                <div
                  className={`relative w-full overflow-hidden bg-zinc-950 ${
                    isFooter ? "aspect-[21/9] min-h-[140px] sm:min-h-[160px]" : "aspect-[16/10]"
                  }`}
                >
                  <AdMedia ad={ad} />
                </div>
                {(ad.title || ad.body) && (
                  <div className="space-y-1 px-4 py-3">
                    {ad.title ? <p className="text-sm font-semibold text-white">{ad.title}</p> : null}
                    {ad.body ? <p className="text-xs leading-relaxed text-zinc-500">{ad.body}</p> : null}
                  </div>
                )}
              </div>
            );

            if (ad.linkUrl?.trim()) {
              return (
                <a
                  key={ad._id}
                  href={ad.linkUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition hover:opacity-95"
                >
                  {inner}
                </a>
              );
            }

            return <div key={ad._id}>{inner}</div>;
          })}
        </div>
        {!isFooter ? (
          <p className="mt-6 text-center text-[11px] text-zinc-600">
            Reklama materiallari sayt ma’muriyati tomonidan joylashtiriladi.
          </p>
        ) : null}
      </div>
    </section>
  );
}
