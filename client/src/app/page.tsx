import { HomeAdsDock } from "@/components/home/HomeAdsDock";
import { HomeEmptyState } from "@/components/home/HomeEmptyState";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeMovieSections } from "@/components/home/HomeMovieSections";
import { TrailerShortsFeed } from "@/components/home/TrailerShortsFeed";
import { AD_PLACEMENT_BOTTOM, AD_PLACEMENT_OVERLAY, fetchAds } from "@/lib/ads";
import { fetchGenres } from "@/lib/genres";
import { pageShell } from "@/lib/pageShell";
import { fetchMovies, pickHeroMovies } from "@/lib/movies";

/** Dev da API bo‘lmasa ham sahifa ochilsin; statik kesh muammolarini kamaytirish */
export const dynamic = "force-dynamic";

export default async function Home() {
  const [movies, overlayAds, bottomAds, genres] = await Promise.all([
    fetchMovies(),
    fetchAds(AD_PLACEMENT_OVERLAY),
    fetchAds(AD_PLACEMENT_BOTTOM),
    fetchGenres(),
  ]);
  const heroMovies = pickHeroMovies(movies);

  const trending = [...movies].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 12);
  const films = movies.filter((m) => m.type === "movie").slice(0, 12);
  const anime = movies.filter((m) => m.type === "anime").slice(0, 12);
  const asianDramas = movies.filter((m) => m.type === "dorama").slice(0, 16);
  const newReleases = movies.filter((m) => m.newRelease).slice(0, 16);

  return (
    <div className="min-h-screen bg-background">
      {heroMovies.length > 0 ? (
        <>
          <HomeHero movies={heroMovies} reserveBottomAdBar />
          <div
            className={`relative z-10 mt-0 space-y-8 pb-[calc(2rem+var(--home-ad-bar-height,7rem))] pt-2 text-left md:space-y-12 ${pageShell}`}
          >
            <TrailerShortsFeed movies={movies} />
            <HomeMovieSections
              genres={genres}
              asianDramas={asianDramas}
              newReleases={newReleases}
              newReleasesFallback={movies.slice(0, 16)}
              trending={trending}
              films={films}
              anime={anime}
            />
          </div>
        </>
      ) : (
        <HomeEmptyState />
      )}

      <HomeAdsDock overlayAds={overlayAds} bottomAds={bottomAds} />
    </div>
  );
}
