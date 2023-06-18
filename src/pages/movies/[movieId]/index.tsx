import type { Movie } from "@prisma/client";
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import type { ParsedUrlQuery } from "querystring";
import React from "react";
import MovieHero from "~/components/MovieHero";
import ShowtimeCard from "~/components/ShowtimeCard";
import { caller } from "~/server/api/root";

// We need to convert our response to and from a string
interface MovieStaticPathParams extends ParsedUrlQuery {
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
  const { movieId } = context.params as MovieStaticPathParams;
  const data = await caller.movies.getMovie({ movieId: +movieId });
  const movie = data.movie;

  // In case, somehow, the movieId, that is created based off a list of movies in the db, does not return a movie from the db.
  if (!movie) {
    return {
      props: {
        movie: {
          movieId: 0,
          title: "",
          description: "",
          ranking: 0,
          posterImage: "",
          backdropImage: "",
        },
      },
    };
  }

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
      <MovieHero movie={movie} />

      <ShowtimeCard
        styleExtensions="mx-8 px-6 py-4 font-bold text-4xl rounded-lg"
        movieId={movie.movieId}
      />
    </>
  );
};

export default MoviePage;
