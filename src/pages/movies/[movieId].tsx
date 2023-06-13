import { Movie } from "@prisma/client";
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import Image from "next/image";
import { ParsedUrlQuery } from "querystring";
import React from "react";
import ShowtimeCard from "~/components/ShowtimeCard";
import { caller } from "~/server/api/root";

// We need to convert our response to and from a string

interface StaticPathParams extends ParsedUrlQuery {
  movieId: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { movieIds } = await caller.movies.getMovieIds();
  const paths = movieIds.map((movieId) => ({
    params: { movieId: `${movieId}` },
  }));
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<MoviePageProps> = async (
  context
) => {
  const { movieId } = context.params as StaticPathParams;
  const data = await caller.movies.getMovie({ movieId: +movieId });
  const movie: Movie = data.movie!;
  return {
    props: {
      movie,
    },
  };
};

type MoviePageProps = {
  movie: Movie;
};

const MoviePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  movie,
}: MoviePageProps) => {
  return (
    <>
      <Head>
        <title>{movie.title} | Fake Theater</title>
      </Head>
      <header className="relative">
        <div
          style={
            {
              "--image-url": `url(${movie.backdropImage})`,
            } as React.CSSProperties
          }
          className="h-72 w-full max-w-7xl bg-gray-500 bg-[image:var(--image-url)] bg-cover bg-center bg-no-repeat bg-blend-multiply"
        ></div>
        <figure className="">
          <Image
            className="absolute left-8 top-8 h-[288px] rounded"
            src={movie.posterImage}
            width={208}
            height={288}
            alt={`Poster for ${movie.title}`}
          />
          <figcaption className="mt-20 px-8">
            <h2 className="text-3xl font-bold">
              {movie.title} at Fake Theater
            </h2>
            <p>{movie.description}</p>
          </figcaption>
        </figure>
      </header>

      <ShowtimeCard
        styleExtensions="mx-8 p-2 font-bold text-4xl rounded-lg"
        movieId={movie.movieId}
      />
    </>
  );
};

export default MoviePage;
