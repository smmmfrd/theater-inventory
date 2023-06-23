import { caller } from "~/server/api/root";
import { api } from "~/utils/api";
import { dateFormatter } from "~/components/ShowtimeCard";
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { useEffect, useState } from "react";
import { TicketOrder } from "@prisma/client";

import { BiChevronLeftCircle } from "react-icons/bi";

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
  const [queryKey, setQueryKey] = useState(0);

  const { data, refetch, isLoading } = api.ticketOrders.getOrders.useQuery(
    { showtimeId: queryKey },
    {
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );

  useEffect(() => {
    void refetch();
  }, [refetch, queryKey]);

  return (
    <>
      <header>
        <h2>Ticket Orders</h2>
      </header>

      <div className="flex flex-wrap gap-2">
        {movies.map((movie) => {
          return movie.showtimes.map((showtime) => (
            <section key={showtime.showtimeId}>
              <header className="flex justify-between gap-4 rounded bg-accent p-2">
                <span>
                  {movie.title} - {showtime.time}
                </span>
                <button onClick={() => setQueryKey(showtime.showtimeId)}>
                  <BiChevronLeftCircle
                    className={`text-2xl transition-transform ${
                      showtime.showtimeId === queryKey
                        ? "-rotate-90"
                        : "rotate-0"
                    }`}
                  />
                </button>
              </header>

              {showtime.showtimeId === queryKey && (
                <ShowtimeData data={data!} isLoading={isLoading} />
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
  data: {
    orders: TicketOrder[];
  };
  isLoading: boolean;
};

const ShowtimeData = ({ data, isLoading }: ShowtimeDataTypes) => {
  if (isLoading) {
    return <div>loading</div>;
  }

  return (
    <div>
      {data.orders.map((order) => (
        <div key={order.ticketId}>
          {order.name} - {order.number}
        </div>
      ))}
    </div>
  );
};
