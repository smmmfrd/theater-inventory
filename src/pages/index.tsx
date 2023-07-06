import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { caller } from "~/server/api/root";

import MovieCard, { type MovieCardType } from "~/components/MovieCard";
import moment from "moment-timezone";

import heroImg from "~/../public/Fake-Theater-Hero.png";
import Image from "next/image";

type HomeProps = {
  movies: MovieCardType[];
  showDateString: string;
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const data = await caller.movies.getMovies();
  const movies: MovieCardType[] = data.movies;
  const { firstShowtime } = await caller.showtimes.getFirstShowtime();
  const showDate = firstShowtime ? firstShowtime.time : new Date();
  const showDateString = moment(showDate).format("ddd, MMMM Do");

  return { props: { movies, showDateString } };
};

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  movies,
  showDateString,
}: HomeProps) => {
  return (
    <>
      <header className="relative mx-auto w-full max-w-3xl">
        <Image
          src={heroImg}
          height={320}
          alt={
            "AI Generated Image representing the front of a fake movie theater."
          }
          className="mb-8  brightness-50"
        />
        <h2 className="absolute bottom-10 left-2 rounded-xl bg-transHero px-2 py-1 text-3xl text-base-100">
          Now Playing at Fake Theater
          <br /> on {showDateString}:
        </h2>
      </header>

      {movies.map((movie) => (
        <MovieCard
          key={movie.movieId}
          title={movie.title}
          posterImage={movie.posterImage}
          movieId={movie.movieId}
        />
      ))}
    </>
  );
};

export default Home;
