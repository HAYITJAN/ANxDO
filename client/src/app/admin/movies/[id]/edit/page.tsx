import { MovieForm } from "@/components/admin/MovieForm";

export default function EditMoviePage({ params }: { params: { id: string } }) {
  return <MovieForm movieId={params.id} />;
}
