import { caller } from "~/server/api/root";
import { api } from "~/utils/api";
import { dateFormatter } from "~/components/ShowtimeCard";
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import React, { useEffect, useState } from "react";
import { type TicketOrder } from "@prisma/client";

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
      <header className="px-8">
        <h2 className="mt-4 text-4xl font-bold">Ticket Orders</h2>
        <p>
          View and Delete any orders here. To find the showtime you are looking
          for faster, use below to filter by the movie.
        </p>

        <h3 className="-mb-4 mt-8 text-2xl">Filter by movie</h3>
        <form className="collapse-plus collapse mt-4 bg-base-300">
          <input type="checkbox" />
          <h4 className="collapse-title truncate font-mono text-lg">
            {selectedMovie.id > 0
              ? `(${selectedMovie.title})`
              : "Pick a movie..."}
          </h4>
          <div className="collapse-content">
            <label className="label cursor-pointer">
              <span className="label-text">All</span>
              <input
                type="radio"
                name="movie"
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
                  name="movie"
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

      <div className="flex flex-wrap justify-center gap-2">
        {movies
          .filter((movie) =>
            selectedMovie.id > 0 ? selectedMovie.id === movie.movieId : true
          )
          .map((movie) => {
            return movie.showtimes.map((showtime) => (
              <section
                key={showtime.showtimeId}
                className="collapse-arrow collapse"
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
                />

                <h3 className="collapse-title">
                  {movie.title} - {showtime.time}
                </h3>

                <div className="collapse-content">
                  {isLoading && (
                    <div className="loading loading-spinner loading-xs mx-auto"></div>
                  )}
                  {showtime.showtimeId === queryKey &&
                    data?.orders !== undefined && (
                      <ShowtimeData data={data} refetch={refetch} />
                    )}
                </div>
              </section>
            ));
          })}
      </div>
    </>
  );
};

export default OrdersPage;

type ShowtimeDataTypes = {
  data: {
    orders: TicketOrder[];
  };
  refetch: () => void;
};

const ShowtimeData = ({ data, refetch }: ShowtimeDataTypes) => {
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
    <div className="flex flex-col gap-1 px-2 py-1">
      {localData.orders.length > 0 ? (
        localData.orders.map((order) => (
          <div className="flex justify-between" key={order.ticketId}>
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
