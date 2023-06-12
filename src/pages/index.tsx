import { GetStaticProps, InferGetStaticPropsType, type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";

import MovieCard, { MovieCardType } from "~/components/MovieCard";
import { caller } from "~/server/api/root";

type HomeProps = {
  movies: MovieCardType[];
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const data = await caller.movies.getMovies();
  const movies: MovieCardType[] = data.movies;

  return { props: { movies } };
};

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  movies,
}: HomeProps) => {
  return (
    <>
      <Head>
        <title>Fake Theater</title>
        <meta name="description" content="Fake Movie Theater Ticket App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="">
        <h1>Fake Theater</h1>
      </nav>

      <main className="flex min-h-screen flex-col">
        <header className="">
          {/* [Carousel] */}
          <h2 className="mx-8 mb-8 text-3xl">
            Now Playing at Fake Theater on [today's date]
          </h2>
        </header>

        {movies.map((movie) => (
          <MovieCard
            key={movie.movieId}
            title={movie.title}
            image={movie.image}
            movieId={movie.movieId}
          />
        ))}

        <footer className="">copy right joe brandon</footer>
      </main>
    </>
  );
};

export default Home;
