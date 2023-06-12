import { Movie } from "@prisma/client";
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import { ParsedUrlQuery } from "querystring";
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

export const getStaticProps: GetStaticProps<MoviePageType> = async (
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

type MoviePageType = {
  movie: Movie;
};

const MoviePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  movie,
}: MoviePageType) => {
  return <div className="">{movie.title}</div>;
};

export default MoviePage;
