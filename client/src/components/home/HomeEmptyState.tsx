"use client";

import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { useLocale } from "@/components/i18n/LocaleContext";
import { pageShell } from "@/lib/pageShell";

export function HomeEmptyState() {
  const { t } = useLocale();

  return (
    <section className={`py-24 pb-[calc(6rem+var(--home-ad-bar-height,7rem))] text-center ${pageShell}`}>
      <h1 className="flex justify-center">
        <BrandWordmark size="lg" />
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-500">{t("home.empty")}</p>
    </section>
  );
}
