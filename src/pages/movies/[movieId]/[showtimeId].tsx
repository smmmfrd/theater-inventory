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
import { TICKET_PRICES } from "~/utils";
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
  ticketPrice: number;
};

type ShowtimePageProps = {
  safeShowtime: SafeShowtime;
  movie: Movie;
  showtimeType: string;
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
          ticketPrice: 0,
        },
        movie: {
          movieId: 0,
          title: "",
          description: "",
          ranking: 0,
          posterImage: "",
          backdropImage: "",
        },
        showtimeType: "",
      },
    };
  } else {
    const safeShowtime: SafeShowtime = {
      ...showtime,
      time: showtime.time.toString(),
    };

    const showtimeType =
      Object.keys(TICKET_PRICES).find(
        (key) =>
          TICKET_PRICES[key as keyof typeof TICKET_PRICES] ===
          showtime.ticketPrice
      ) || "";

    return {
      props: {
        safeShowtime,
        movie,
        showtimeType,
      },
    };
  }
};

const ShowtimePage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ safeShowtime, movie, showtimeType }: ShowtimePageProps) => {
  const { data, isLoading } = api.showtimes.getShowtime.useQuery({
    showtimeId: safeShowtime.showtimeId,
  });

  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(dateFormatter.format(new Date(safeShowtime.time)));
  }, [safeShowtime.time]);

  const DisplayForm = () => {
    if (isLoading) {
      return (
        <div className="loading loading-spinner loading-lg mx-auto block"></div>
      );
    }

    if (data?.showtime && data.showtime.availableSeats > 0) {
      return (
        <ShowtimePageForm
          availableSeats={data.showtime.availableSeats}
          time={time}
          movieTitle={movie.title}
          showtimeId={safeShowtime.showtimeId}
          movieId={safeShowtime.movieId}
          ticketPrice={safeShowtime.ticketPrice}
          showtimeType={showtimeType}
        />
      );
    }

    return (
      <h3 className="text-center text-4xl font-bold underline">
        This Showing is Sold Out!
      </h3>
    );
  };

  return (
    <>
      <MovieHero movie={movie} altTitle={`${time} showing for ${movie.title}`}>
        <DisplayForm />
      </MovieHero>

      <Link
        href={`/movies/${movie.movieId}`}
        className="btn-primary btn mx-auto mb-4 mt-12 md:mt-4"
      >
        See other showtimes
      </Link>
    </>
  );
};

type ShowtimePageFormProps = {
  availableSeats: number;
  time: string;
  movieTitle: string;
  showtimeId: number;
  movieId: number;
  ticketPrice: number;
  showtimeType: string;
};

function ShowtimePageForm({
  availableSeats,
  time,
  movieTitle,
  showtimeId,
  movieId,
  ticketPrice,
  showtimeType,
}: ShowtimePageFormProps) {
  const router = useRouter();

  const { addTicket: addTickets } = useTicketStore();

  const [formData, setFormData] = useState({
    tickets: 1,
  });

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;

    let realValue = parseInt(value);
    if (name === "tickets" && realValue > availableSeats) {
      realValue = availableSeats;
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
      movieTitle,
      showtimeId,
      movieId,
      ticketPrice,
      showtimeType,
    });
    void router.push("/cart");
  };

  const showtimeTypeToStyle = () => {
    switch (showtimeType) {
      case "matinee":
        return "bg-info text-info-content";
      case "afternoon":
        return "bg-success text-success-content";
      case "lateNight":
        return "bg-error text-error-content";
    }
  };

  return (
    <div className="mx-auto flex flex-col items-center md:justify-evenly">
      {/* PRICING INFO */}
      <p className="mb-6 mt-2 text-center text-lg md:m-0">
        <span
          className={`mr-4 rounded-xl px-3 py-4 text-2xl capitalize ${showtimeTypeToStyle()}`}
        >
          {showtimeType.split(/(?=[A-Z])/).join(" ")}
        </span>
        <span className="font-thin italic">( {ticketPrice}$ each )</span>
      </p>

      {/* HERO & TICKET AMOUNT */}
      <h3 className="mb-2 text-center text-lg md:m-0">
        <span className="font-bold underline">Order Tickets</span> - Only{" "}
        {availableSeats} Seats Left!
      </h3>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="join">
        <input
          type="number"
          min="1"
          max={availableSeats}
          className="input-bordered input join-item w-28 text-xl"
          name="tickets"
          value={formData.tickets}
          onChange={handleChange}
        />
        <button className="btn-outline join-item btn text-base" type="submit">
          Add to Cart
        </button>
      </form>
    </div>
  );
}

export default ShowtimePage;
