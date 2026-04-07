import type { ReactNode } from "react";
import type { MovieListItem } from "@/lib/movies";
import { MoviePosterCard } from "@/components/ui/MoviePosterCard";
import { ScrollRow } from "./ScrollRow";

type Props = {
  heading: ReactNode;
  movies: MovieListItem[];
  showNewBadges?: boolean;
};

export function MovieRow({ heading, movies, showNewBadges }: Props) {
  if (!movies.length) return null;

  return (
    <section className="mb-7 md:mb-9">
      <div>{heading}</div>
      <ScrollRow>
        {movies.map((m) => (
          <MoviePosterCard key={m._id} movie={m} showNewBadge={showNewBadges} size="row" />
        ))}
      </ScrollRow>
    </section>
  );
}
