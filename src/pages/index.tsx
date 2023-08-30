import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { caller } from "~/server/api/root";

import MovieCard, { type MovieCardProps } from "~/components/MovieCard";
import moment from "moment-timezone";

import heroImg from "~/../public/Fake-Theater-Hero.png";
import Image from "next/image";
import Head from "next/head";

type HomeProps = {
  movies: MovieCardProps[];
  showDateString: string;
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const data = await caller.movies.getMovies();
  const movies: MovieCardProps[] = data.movies;
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
      <Head>
        <title>Fake Theater</title>
        <meta name="description" content="Fake Movie Theater Ticket App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="relative mx-auto mb-8 w-full max-w-5xl">
        <Image
          src={heroImg}
          height={320}
          alt={
            "AI Generated Image representing the front of a fake movie theater."
          }
          className="brightness-50"
        />
        <h2 className="w-96 rounded-xl px-2 py-1 text-3xl text-neutral-content lg:w-full">
          Now Playing at Fake Theater on {showDateString}:
        </h2>
      </header>

      <main className="bg-base grid min-h-screen sm:grid-cols-[repeat(auto-fit,minmax(512px,1fr))]">
        {movies.map((movie) => (
          <MovieCard
            key={movie.movieId}
            title={movie.title}
            posterImage={movie.posterImage}
            movieId={movie.movieId}
            showtimeCount={movie.showtimeCount}
          />
        ))}
      </main>
    </>
  );
};

export default Home;
