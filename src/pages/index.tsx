import { GetStaticProps, InferGetStaticPropsType, type NextPage } from "next";
import { caller } from "~/server/api/root";

import MovieCard, { MovieCardType } from "~/components/MovieCard";

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
          posterImage={movie.posterImage}
          movieId={movie.movieId}
        />
      ))}
    </>
  );
};

export default Home;
