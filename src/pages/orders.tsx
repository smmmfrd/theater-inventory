import { caller } from "~/server/api/root";
import { api } from "~/utils/api";
import { dateFormatter } from "~/components/ShowtimeCard";
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import React, { useEffect, useState } from "react";
import { type TicketOrder } from "@prisma/client";
import RegularLayout from "~/components/RegularLayout";
import Head from "next/head";

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

  const [selectedMovie, setSelectedMovie] = useState({
    id: 0,
    title: "",
  });

  return (
    <>
      <Head>
        <title>Orders | Fake Theater</title>
      </Head>
      <RegularLayout>
        <header className="max-w-md px-8 sm:mx-auto">
          <h2 className="mt-4 text-4xl font-bold">Ticket Orders</h2>
          <p>
            View and Delete any orders here. To find the showtime you are
            looking for faster, use below to filter by the movie.
          </p>

          <h3 className="-mb-3 mt-8 text-2xl underline">Filter by movie</h3>
          <form className="collapse-plus collapse mt-4 bg-base-300">
            <input type="checkbox" />
            <h4 className="collapse-title truncate font-mono text-lg text-neutral-content">
              {selectedMovie.id > 0
                ? `(${selectedMovie.title})`
                : "Pick a movie..."}
            </h4>
            <div className="collapse-content">
              <label className="label cursor-pointer">
                <span className="label-text">All</span>
                <input
                  type="radio"
                  name="all"
                  className="radio"
                  value={0}
                  checked={selectedMovie.id === 0}
                  onChange={() => setSelectedMovie({ id: 0, title: "" })}
                />
              </label>
              {movies.map(({ title, movieId, showtimes }) => (
                <label key={movieId} className="label cursor-pointer">
                  <span className="label-text">
                    {title} - {showtimes.length}
                  </span>
                  <input
                    type="radio"
                    name={title}
                    className="radio"
                    value={movieId}
                    checked={selectedMovie.id === movieId}
                    onChange={() => setSelectedMovie({ id: movieId, title })}
                  />
                </label>
              ))}
            </div>
          </form>
        </header>

        <div className="flex max-w-4xl flex-wrap justify-center gap-2 md:mx-auto">
          {movies
            .filter((movie) =>
              selectedMovie.id > 0 ? selectedMovie.id === movie.movieId : true
            )
            .map((movie) => {
              return movie.showtimes.map((showtime) => (
                <section
                  key={showtime.showtimeId}
                  className="collapse-arrow collapse h-min w-max border-2 text-neutral-content"
                >
                  <input
                    type="checkbox"
                    onChange={() =>
                      setQueryKey(
                        showtime.showtimeId === queryKey
                          ? -1
                          : showtime.showtimeId
                      )
                    }
                    checked={showtime.showtimeId === queryKey}
                  />
                  {/* Showtime Title & Time */}
                  <h3
                    className={`collapse-title ${
                      showtime.showtimeId === queryKey && "border-b-2"
                    } w-64`}
                  >
                    {/* Truncate Movie Title */}
                    {movie.title.length > 12
                      ? `${movie.title.slice(0, 12)}...`
                      : movie.title}{" "}
                    - {showtime.time}
                  </h3>

                  {showtime.showtimeId === queryKey && (
                    <div className="collapse-content">
                      {isLoading && (
                        <div className="w-full pt-4 text-center">
                          <div className="loading loading-dots loading-xs"></div>
                        </div>
                      )}
                      {data?.orders !== undefined && (
                        <ShowtimeData data={data} refetch={refetch} />
                      )}
                    </div>
                  )}
                </section>
              ));
            })}
        </div>
      </RegularLayout>
    </>
  );
};

export default OrdersPage;

type ShowtimeDataProps = {
  data: {
    orders: TicketOrder[];
  };
  refetch: () => void;
};

const ShowtimeData = ({ data, refetch }: ShowtimeDataProps) => {
  const [localData, setLocalData] = useState(data);

  const { mutate: localMutate } = api.ticketOrders.deleteOrder.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = (ticketId: string) => {
    if (localData?.orders === undefined) return;

    setLocalData((prevData) => ({
      orders: prevData?.orders.filter((order) => order.ticketId !== ticketId),
    }));

    localMutate({ ticketId });
  };

  return (
    <div className="flex flex-col gap-3 px-0.5 pt-3">
      {localData.orders.length > 0 ? (
        localData.orders.map((order) => (
          <div
            className="flex w-full justify-between gap-2"
            key={order.ticketId}
          >
            {order.name} - {order.number}
            <button
              className="btn-outline btn-xs btn-circle btn border-2"
              title="Delete Order"
              onClick={() => handleDelete(order.ticketId)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))
      ) : (
        <div>no orders here</div>
      )}
    </div>
  );
};
