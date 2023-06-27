import { caller } from "~/server/api/root";
import { api } from "~/utils/api";
import { dateFormatter } from "~/components/ShowtimeCard";
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import React, { useEffect, useState } from "react";
import { type TicketOrder } from "@prisma/client";
import Image from "next/image";

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
  const [queryKey, setQueryKey] = useState(-1);

  const { data, refetch, isLoading } = api.ticketOrders.getOrders.useQuery(
    { showtimeId: queryKey },
    {
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );

  useEffect(() => {
    if (queryKey > -1) {
      void refetch();
    }
  }, [refetch, queryKey]);

  const [selectedMovie, setSelectedMovie] = useState(0);

  const handleRadioChange = (e: React.FormEvent<HTMLInputElement>) => {
    const input = parseInt(e.currentTarget.value);
    setSelectedMovie(input);
  };

  return (
    <>
      <header className="px-8">
        <h2 className="mt-4 text-4xl font-bold">Ticket Orders</h2>

        <form className="collapse-plus collapse mt-4 bg-base-300">
          <input type="checkbox" />
          <h3 className="collapse-title text-2xl">Filter by movie</h3>
          <div className="collapse-content">
            <label className="label cursor-pointer">
              <span className="label-text">All</span>
              <input
                type="radio"
                name="movie"
                className="radio"
                value={0}
                checked={selectedMovie === 0}
                onChange={handleRadioChange}
              />
            </label>
            {movies.map(({ title, movieId, showtimes }) => (
              <label className="label cursor-pointer">
                <span className="label-text">
                  {title} - {showtimes.length}
                </span>
                <input
                  type="radio"
                  name="movie"
                  className="radio"
                  value={movieId}
                  checked={selectedMovie === movieId}
                  onChange={handleRadioChange}
                />
              </label>
            ))}
          </div>
        </form>
      </header>

      <div className="flex flex-wrap justify-center gap-2">
        {movies
          .filter((movie) =>
            selectedMovie > 0 ? selectedMovie === movie.movieId : true
          )
          .map((movie) => {
            return movie.showtimes.map((showtime) => (
              <section key={showtime.showtimeId}>
                <header className="flex justify-between gap-4 rounded bg-accent p-2">
                  <span>
                    {movie.title} - {showtime.time}
                  </span>
                  <button
                    title="Open showtime's order list."
                    onClick={() =>
                      setQueryKey(
                        showtime.showtimeId === queryKey
                          ? -1
                          : showtime.showtimeId
                      )
                    }
                  >
                    <Image
                      src="/bx-chevron-left-circle.svg"
                      alt="Chevron Icon for opening this showtime's order list"
                      width="24"
                      height="24"
                      className={`transition-transform ${
                        showtime.showtimeId === queryKey
                          ? "-rotate-90"
                          : "rotate-0"
                      }`}
                    />
                  </button>
                </header>

                {showtime.showtimeId === queryKey && (
                  <ShowtimeData data={data} isLoading={isLoading} />
                )}
              </section>
            ));
          })}
      </div>
    </>
  );
};

export default OrdersPage;

type ShowtimeDataTypes = {
  data:
    | {
        orders: TicketOrder[];
      }
    | undefined;
  isLoading: boolean;
};

const ShowtimeData = ({ data, isLoading }: ShowtimeDataTypes) => {
  if (isLoading) {
    return <div>loading</div>;
  }

  return (
    <div>
      {data?.orders.map((order) => (
        <div key={order.ticketId}>
          {order.name} - {order.number}
        </div>
      ))}
    </div>
  );
};
