import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, type Movie } from "@prisma/client";
import "dotenv/config";
import moment from "moment-timezone";

const START_HOUR = 12;
const HOURS_BETWEEN = 3;
const MINUTES_BETWEEN = 10;

interface MovieIndexMapType {
  [key: number]: number[];
}
// A map to find what movie goes to which theater.
const THEATER_TO_MOVIE: MovieIndexMapType = {
  0: [0, 0],
  1: [1, 1],
  2: [0, 0],
  3: [1, 1],
  4: [0, 0],
  5: [2, 2],
  6: [0, 0],
  7: [2, 2],
  8: [0, 0],
  9: [3, 3],
  10: [0, 0],
  11: [3, 3],
  12: [0, 0],
  13: [4, 5],
  14: [1, 1],
  15: [6, 7],
};

const getMovieIndex = (index: number, even: boolean): number => {
  // Even just determines flickering between the bottom two movies
  const movieIndex = THEATER_TO_MOVIE[index]![+even];
  return movieIndex === undefined ? -1 : movieIndex;
};

const prisma = new PrismaClient();

type TMDBMovie = {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: 385687;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

type TMDBRes = {
  results: TMDBMovie[];
};

async function getMovies() {
  if (
    process.env.MOVIE_DB_API_KEY === null ||
    process.env.MOVIE_DB_API_KEY === undefined
  ) {
    return;
  }

  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.MOVIE_DB_API_KEY}&page=1`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  const res = await fetch(url, options);
  const json = (await res.json()) as TMDBRes;
  const movies: Movie[] = json.results
    .filter((_: TMDBMovie, i: number) => i < 8)
    .map((movie: TMDBMovie, index: number): Movie => {
      return {
        movieId: movie.id,
        title: movie.title,
        description: movie.overview,
        posterImage: `https://image.tmdb.org/t/p/w780${movie.poster_path}`,
        backdropImage: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
        ranking: index,
      };
    });

  return movies;
}

function makeShowtimes(startTime: moment.Moment) {
  const showtimes = [startTime];
  let newTime = moment(startTime).add(HOURS_BETWEEN, "hours");
  while (!newTime.isAfter(startTime, "day")) {
    showtimes.push(newTime);
    newTime = moment(newTime).add(HOURS_BETWEEN, "hours");
  }

  return showtimes;
}

function MakeTheaters(startTime: moment.Moment) {
  const theaters = Array(16)
    .fill(0)
    .map((_, index) => {
      const theaterStart = moment(startTime).add(
        MINUTES_BETWEEN * index,
        "minutes"
      );
      const showtimes = makeShowtimes(theaterStart);

      return {
        theaterId: index,
        showtimes,
      };
    });

  return theaters;
}

export default async function reset(req: NextApiRequest, res: NextApiResponse) {
  // Clear out all old data
  await prisma.movie.deleteMany();
  await prisma.theater.deleteMany();

  // Create the start date
  const showDate = moment().tz("America/Los_Angeles").weekday(7).set({
    hour: START_HOUR,
    minute: 0,
    second: 0,
  });

  // Create the starting data
  const movieData = await getMovies();
  const theaterData = MakeTheaters(showDate);

  if (movieData === undefined) {
    return;
  }

  // Push the basic data to prisma
  await prisma.movie.createMany({ data: [...movieData] });
  await prisma.theater.createMany({
    data: theaterData.map((theater) => ({
      theaterId: theater.theaterId,
    })),
  });
  await prisma.showtime.createMany({
    data: theaterData
      .map(({ showtimes, theaterId }) => {
        return showtimes.map((showtime, index) => ({
          time: showtime.toDate(),
          maxSeats: 64,
          theaterId,
          movieId:
            movieData[getMovieIndex(theaterId, index % 2 == 0)]?.movieId || 0,
        }));
      })
      .flat(),
  });

  // Trigger redeploy
  if (
    process.env.RESET_LINK !== null &&
    process.env.RESET_LINK !== undefined &&
    !!process.env.VERCEL_URL
  ) {
    await fetch(`${process.env.RESET_LINK}`);
    console.log("Called redeploy link");
  }

  console.log("Theater Reset.");

  res.status(200).json({ message: "Success" });
}

if (!process.env.VERCEL_URL) {
  // void reset();
}
