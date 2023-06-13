import { useRouter } from "next/router";
import { dateFormatter } from "~/components/ShowtimeCard";
import { api } from "~/utils/api";

export default function ShowtimePage() {
  const router = useRouter();

  const showtimeQuery = api.showtimes.getShowtime.useQuery(
    {
      showtimeId: +router.query.showtimeId!,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );
  const movieQuery = api.movies.getMovie.useQuery(
    {
      movieId: +router.query.movieId!,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  return (
    <>
      <h2>
        {dateFormatter.format(showtimeQuery.data?.showtime?.time)} showing for{" "}
        {movieQuery.data?.movie?.title}
      </h2>
    </>
  );
}
