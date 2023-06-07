import { GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import MovieCard from "~/components/MovieCard";

type Data = {
  name: string;
};

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async () => {
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.MOVIE_DB_API_KEY}&page=1`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  const res = await fetch(url, options);
  const json = await res.json();
  const movies = json.results
    .filter((_: any, i: number) => i < 8)
    .map((movie: any) => {
      return {
        id: movie.id,
        title: movie.title,
        // description: movie.overview,
        // image: `https://image.tmdb.org/t/p/w780${movie.poster_path}`,
      };
    });

  console.log(movies);

  const data = { name: "" };
  return {
    props: { data },
  };
};

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

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
