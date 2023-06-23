import { PrismaClient, type Movie } from "@prisma/client";
import "dotenv/config";
import moment from "moment-timezone";

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

const getMovieIndex = (index: number, even: boolean) => {
  // Even just determines flickering between the bottom two movies
  if (index % 2 == 0) {
    return 0;
  } else {
    if (index < 4) {
      return 1;
    } else if (index < 8) {
      return 2;
    } else if (index < 12) {
      return 3;
    } else if (index < 14) {
      return even ? 4 : 5;
    } else {
      return even ? 6 : 7;
    }
  }
};

function makeShowtimes(startTime: moment.Moment) {
  const showtimes = [startTime];
  // let newTime = addHours(startTime, 3);
  let newTime = moment(startTime).add(3, "hours");
  while (!newTime.isAfter(startTime, "day")) {
    showtimes.push(newTime);
    // newTime = addHours(newTime, 3);
    newTime = moment(newTime).add(3, "hours");
  }

  return showtimes;
}

function MakeTheaters(startTime: moment.Moment) {
  const theaters = Array(16)
    .fill(0)
    .map((_, index) => {
      // const theaterStart = addMinutes(startTime, 15 * index);
      const theaterStart = moment(startTime).add(15 * index, "minutes");
      const showtimes = makeShowtimes(theaterStart);

      return {
        theaterId: index,
        showtimes,
      };
    });

  return theaters;
}

export default async function reset() {
  // Clear out all old data
  await prisma.movie.deleteMany();
  await prisma.theater.deleteMany();

  // Create the start date
  const showDate = moment().tz("America/Los_Angeles").weekday(7).set({
    hour: 10,
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
    void fetch(`${process.env.RESET_LINK}`);
  }

  console.log("Theater Reset.");
}

if (!process.env.VERCEL_URL) {
  void reset();
}
