import type { Movie } from "@prisma/client";
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ParsedUrlQuery } from "querystring";
import React, { useEffect, useState } from "react";
import MovieHero from "~/components/MovieHero";
import { dateFormatter } from "~/components/ShowtimeCard";
import { caller } from "~/server/api/root";
import { useTicketStore } from "~/store/TicketStore";
import { api } from "~/utils/api";

interface ShowtimeStaticPathParams extends ParsedUrlQuery {
  movieId: string;
  showtimeId: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { showtimes } = await caller.showtimes.getAllShowtimeAndMovieIds();
  const paths = showtimes.map((showtime) => ({
    params: {
      showtimeId: `${showtime.showtimeId}`,
      movieId: `${showtime.movieId}`,
    },
  }));
  return {
    paths,
    fallback: false,
  };
};

type SafeShowtime = {
  time: string;
  maxSeats: number;
  availableSeats: number;
  theaterId: number;
  showtimeId: number;
  movieId: number;
};

type ShowtimePageProps = {
  safeShowtime: SafeShowtime;
  movie: Movie;
};

export const getStaticProps: GetStaticProps<ShowtimePageProps> = async (
  context
) => {
  const { showtimeId, movieId } = context.params as ShowtimeStaticPathParams;

  const showtimeQuery = await caller.showtimes.getShowtime({
    showtimeId: +showtimeId,
  });
  const showtime = showtimeQuery.showtime;

  const movieQuery = await caller.movies.getMovie({ movieId: +movieId });
  const movie = movieQuery.movie;

  if (!showtime || !movie) {
    return {
      props: {
        safeShowtime: {
          time: "",
          maxSeats: 0,
          availableSeats: 0,
          theaterId: 0,
          showtimeId: 0,
          movieId: 0,
        },
        movie: {
          movieId: 0,
          title: "",
          description: "",
          ranking: 0,
          posterImage: "",
          backdropImage: "",
        },
      },
    };
  } else {
    const safeShowtime: SafeShowtime = {
      ...showtime,
      time: showtime.time.toString(),
    };

    return {
      props: {
        safeShowtime,
        movie,
      },
    };
  }
};

const ShowtimePage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ safeShowtime, movie }: ShowtimePageProps) => {
  const router = useRouter();
  const { addTicket: addTickets } = useTicketStore();
  const { data } = api.showtimes.getShowtime.useQuery({
    showtimeId: safeShowtime.showtimeId,
  });

  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(dateFormatter.format(new Date(safeShowtime.time)));
  }, [safeShowtime.time]);

  const [formData, setFormData] = useState({
    tickets: 1,
  });

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;

    let realValue = parseInt(value);

    // Prevent hard overwriting (by inputing a number > available seating)
    const availSeats = data?.showtime
      ? data.showtime.availableSeats
      : safeShowtime.availableSeats;
    if (name === "tickets" && realValue > availSeats) {
      realValue = availSeats;
    }

    setFormData((prevForm) => ({
      ...prevForm,
      [name]: realValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addTickets({
      number: formData.tickets,
      showtime: time,
      movieTitle: movie.title,
      showtimeId: safeShowtime.showtimeId,
    });
    void router.push("/cart");
  };

  return (
    <>
      <MovieHero
        movie={movie}
        altTitle={`${time} showing for ${movie.title}`}
      />
      <section className="flex flex-col gap-8 px-8">
        {data?.showtime?.availableSeats &&
        data?.showtime?.availableSeats > 0 ? (
          <div className="mx-auto">
            <h3 className=" mb-2 text-center text-lg">
              <span className="font-bold underline">Order Tickets</span> - Only{" "}
              {data?.showtime?.availableSeats} Seats Left!
            </h3>
            <form onSubmit={handleSubmit} className="join">
              <input
                type="number"
                min="1"
                max={
                  data?.showtime
                    ? data.showtime.availableSeats
                    : safeShowtime.availableSeats
                }
                className="input-bordered input join-item"
                name="tickets"
                value={formData.tickets}
                onChange={handleChange}
              />
              <button
                className="btn-outline join-item btn text-base"
                type="submit"
              >
                Add to Cart
              </button>
            </form>
          </div>
        ) : (
          <h3 className="text-4xl font-bold underline">
            This Showing is Sold Out!
          </h3>
        )}

        <Link
          href={`/movies/${movie.movieId}`}
          className="btn-primary btn mx-auto"
        >
          See other showtimes
        </Link>
      </section>
    </>
  );
};

export default ShowtimePage;
