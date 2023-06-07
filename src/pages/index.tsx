import { GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";
import { caller } from "~/server/api/root";

import MovieCard from "~/components/MovieCard";

type Data = {
  name: string;
};

type Movie = {
  id: number;
  title: string;
};

type TopMovies = [Movie, Movie, Movie, Movie, Movie, Movie, Movie, Movie];

async function getMovies() {
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.MOVIE_DB_API_KEY}&page=1`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  const res = await fetch(url, options);
  const json = await res.json();
  const movies: TopMovies = json.results
    .filter((_: any, i: number) => i < 8)
    .map((movie: any) => {
      return {
        id: movie.id,
        title: movie.title,
        // description: movie.overview,
        // image: `https://image.tmdb.org/t/p/w780${movie.poster_path}`,
      };
    });

  return movies;
}

async function buildTheaters(movies: TopMovies) {
  const indexToMovie = (index: number, even: boolean) => {
    // Should not have .title in final version.
    if (index % 2 == 0) {
      return movies[0].title;
    } else {
      if (index < 4) {
        return movies[1].title;
      } else if (index < 8) {
        return movies[2].title;
      } else if (index < 12) {
        return movies[3].title;
      } else if (index < 14) {
        return movies[even ? 4 : 5].title;
      } else {
        return movies[even ? 6 : 7].title;
      }
    }
  };

  const newTheater = (_: any, index: number) => {
    const startTime = 10.5 + Math.floor(index / 2) * 0.25;
    const showtimes = [];

    let even = false;
    for (let time = startTime; time < 24; time += 3) {
      even = !even;
      // Uncomment this
      // showtimes.push({
      //   time,
      //   movie: indexToMovie(index, even),
      // });
      showtimes.push(indexToMovie(index, even));
    }

    return {
      number: index,
      showtimes,
    };
  };

  const theaters = [...Array(16).fill(0).map(newTheater)];
  return theaters;
}

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async () => {
  const movies = await getMovies();
  const trpcRes = await caller.movies.setMovies(movies);

  const theaters = await buildTheaters(movies);
  console.log(theaters);

  const data = { name: "" };
  return {
    props: { data },
  };
};

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

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
          [Carousel]
          <h2 className="mx-8 mb-8 text-3xl">
            Now Playing at Fake Theater on [today's date]
          </h2>
        </header>

        <MovieCard />

        <footer className="">copy right joe brandon</footer>
      </main>
    </>
  );
};

export default Home;
