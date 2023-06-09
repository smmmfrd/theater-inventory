import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

import MovieCard from "~/components/MovieCard";

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
