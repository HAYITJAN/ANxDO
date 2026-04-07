import type { MovieListItem } from "@/lib/movies";
import { ScrollRow } from "@/components/home/ScrollRow";
import { MoviePosterCard } from "@/components/ui/MoviePosterCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function MoreLikeThis({ movies }: { movies: MovieListItem[] }) {
  if (!movies.length) return null;

  return (
    <section className="mt-16 border-t border-white/[0.06] pt-12">
      <SectionHeading accent="More" rest="Like This" />
      <ScrollRow>
        {movies.map((m) => (
          <MoviePosterCard key={m._id} movie={m} showNewBadge size="featured" />
        ))}
      </ScrollRow>
    </section>
  );
}
