import { type TicketOrder } from "@prisma/client";
import { caller } from "~/server/api/root";
import { api } from "~/utils/api";
import { dateFormatter } from "~/components/ShowtimeCard";
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";

type SimpleMovie = {
  title: string;
  movieId: number;
  showtimes: string[];
};

type OrdersPageProps = {
  movies: SimpleMovie[];
};

export const getStaticProps: GetStaticProps<OrdersPageProps> = async () => {
  const { moviesWithShowtimes } = await caller.movies.getMoviesWithShowtimes();

  const movies = moviesWithShowtimes.map(
    (movieNtime): SimpleMovie => ({
      ...movieNtime,
      showtimes: movieNtime.showtimes.map(({ time }) =>
        dateFormatter.format(time)
      ),
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
  return (
    <>
      <header>
        <h2>Ticket Orders</h2>
      </header>

      <div className="flex flex-wrap gap-2">
        {movies.map((movie) => {
          return movie.showtimes.map((time) => (
            <section key={movie.movieId}>
              <header className="rounded bg-accent p-2">
                {movie.title} - {time}
              </header>
            </section>
          ));
        })}
      </div>
    </>
  );
};

export default OrdersPage;
