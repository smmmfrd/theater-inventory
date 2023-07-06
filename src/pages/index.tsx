import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { caller } from "~/server/api/root";

import MovieCard, { type MovieCardType } from "~/components/MovieCard";
import moment from "moment-timezone";

type HomeProps = {
  movies: MovieCardType[];
  showDateString: string;
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const data = await caller.movies.getMovies();
  const movies: MovieCardType[] = data.movies;
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
      <header className="">
        {/* [Carousel] */}
        <h2 className="mx-8 mb-8 mt-6 text-3xl">
          Now Playing at Fake Theater on {showDateString}
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
