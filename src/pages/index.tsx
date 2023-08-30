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
  // return (
  //   <header className="absolute top-0 w-full">
  //     <Image
  //       src={heroImg}
  //       height={320}
  //       alt={
  //         "AI Generated Image representing the front of a fake movie theater."
  //       }
  //       className="mx-auto mb-8 max-w-5xl brightness-50"
  //     />
  //     <h2 className="absolute bottom-10 left-2 w-96 rounded-xl bg-transHero px-2 py-1 text-3xl text-base-content lg:w-max">
  //       Now Playing at Fake Theater on {showDateString}:
  //     </h2>
  //   </header>
  // );

  return (
    <>
      <Head>
        <title>Fake Theater</title>
        <meta name="description" content="Fake Movie Theater Ticket App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-base grid min-h-screen grid-cols-[repeat(auto-fit,minmax(512px,1fr))] pt-96">
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
