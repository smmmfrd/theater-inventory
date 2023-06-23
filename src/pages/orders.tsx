import { caller } from "~/server/api/root";
import { api } from "~/utils/api";
import { dateFormatter } from "~/components/ShowtimeCard";
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";

type SimpleMovie = {
  title: string;
  movieId: number;
  showtimes: {
    time: string;
    showtimeId: number;
  }[];
};

type OrdersPageProps = {
  movies: SimpleMovie[];
};

export const getStaticProps: GetStaticProps<OrdersPageProps> = async () => {
  const { moviesWithShowtimes } = await caller.movies.getMoviesWithShowtimes();

  const movies = moviesWithShowtimes.map(
    (movieNtime): SimpleMovie => ({
      ...movieNtime,
      showtimes: movieNtime.showtimes.map(({ time, showtimeId }) => ({
        time: dateFormatter.format(time),
        showtimeId,
      })),
    })
  );

  return {
    props: {
      movies,
    },
  };
};

const OrdersPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  movies,
}) => {
  // const {data, refetch} = api.

  return (
    <>
      <header>
        <h2>Ticket Orders</h2>
      </header>

      <div className="flex flex-wrap gap-2">
        {movies.map((movie) => {
          return movie.showtimes.map((showtime) => (
            <section key={movie.movieId}>
              <header className="rounded bg-accent p-2">
                {movie.title} - {showtime.time}
              </header>
            </section>
          ));
        })}
      </div>
    </>
  );
};

export default OrdersPage;
