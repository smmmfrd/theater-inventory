import { Movie } from "@prisma/client";
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Link from "next/link";
import { ParsedUrlQuery } from "querystring";
import React, { useEffect, useState } from "react";
import MovieHero from "~/components/MovieHero";
import { dateFormatter } from "~/components/ShowtimeCard";
import { caller } from "~/server/api/root";

interface ShowtimeStaticPathParams extends ParsedUrlQuery {
  movieId: string;
  showtimeId: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { showtimes } = await caller.showtimes.getAllShowtimes();
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
  const showtime = showtimeQuery.showtime!;
  const safeShowtime: SafeShowtime = {
    ...showtime,
    time: showtime.time.toString(),
  };

  const movieQuery = await caller.movies.getMovie({ movieId: +movieId });
  const movie = movieQuery.movie!;

  return {
    props: {
      safeShowtime,
      movie,
    },
  };
};

const ShowtimePage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ safeShowtime, movie }: ShowtimePageProps) => {
  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(dateFormatter.format(new Date(safeShowtime.time)));
  }, []);

  const [formData, setFormData] = useState({
    tickets: 1,
  });

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <>
      <MovieHero
        movie={movie}
        altTitle={`${time} showing for ${movie.title}`}
      />
      <section className="flex flex-col gap-12 px-8">
        <div className="mx-auto">
          <h3 className="mb-2 font-bold underline">Order Tickets</h3>
          <form onSubmit={handleSubmit} className="join">
            <input
              type="number"
              min="1"
              className="input-bordered input join-item"
              name="tickets"
              value={formData.tickets}
              onChange={handleChange}
            />
            <button className="btn-outline join-item btn" type="submit">
              Place Order
            </button>
          </form>
        </div>

        <Link href={`/movies/${movie.movieId}`} className="link">
          See other showtimes
        </Link>
      </section>
    </>
  );
};

export default ShowtimePage;
