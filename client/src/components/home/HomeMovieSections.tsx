"use client";

import { useLocale } from "@/components/i18n/LocaleContext";
import type { Genre } from "@/lib/genres";
import type { MovieListItem } from "@/lib/movies";
import { ExploreGenres } from "@/components/home/ExploreGenres";
import { MovieRow } from "@/components/home/MovieRow";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Props = {
  genres: Genre[];
  asianDramas: MovieListItem[];
  newReleases: MovieListItem[];
  newReleasesFallback: MovieListItem[];
  trending: MovieListItem[];
  films: MovieListItem[];
  anime: MovieListItem[];
};

export function HomeMovieSections({
  genres,
  asianDramas,
  newReleases,
  newReleasesFallback,
  trending,
  films,
  anime,
}: Props) {
  const { t } = useLocale();
  const newRowMovies = newReleases.length > 0 ? newReleases : newReleasesFallback;

  return (
    <div className="pt-2">
      <ExploreGenres genres={genres} />
      <MovieRow
        heading={<SectionHeading accent={t("home.rowAsianAccent")} rest={t("home.rowAsianRest")} />}
        movies={asianDramas}
        showNewBadges
      />
      <MovieRow
        heading={<SectionHeading accent={t("home.rowNewAccent")} rest={t("home.rowNewRest")} />}
        movies={newRowMovies}
        showNewBadges
      />
      <MovieRow
        heading={<SectionHeading accent={t("home.rowTrendingAccent")} rest={t("home.rowTrendingRest")} />}
        movies={trending}
      />
      <MovieRow
        heading={<SectionHeading accent={t("home.rowMoviesAccent")} />}
        movies={films}
      />
      <MovieRow
        heading={<SectionHeading accent={t("home.rowAnimeAccent")} />}
        movies={anime}
      />
    </div>
  );
}
