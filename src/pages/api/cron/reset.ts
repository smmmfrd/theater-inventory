import { PrismaClient, type Movie } from "@prisma/client";
import "dotenv/config";

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

function addMinutes(time: Date, minutes: number) {
  return new Date(time.getTime() + minutes * 60 * 1000);
}

function addHours(time: Date, hours: number) {
  return new Date(time.getTime() + hours * 60 * 60 * 1000);
}

function makeShowtimes(startTime: Date) {
  const showtimes = [startTime];
  let newTime = addHours(startTime, 3);
  while (newTime.getDate() === startTime.getDate()) {
    showtimes.push(newTime);
    newTime = addHours(newTime, 3);
  }

  return showtimes;
}

function MakeTheaters(startTime: Date) {
  const theaters = Array(16)
    .fill(0)
    .map((_, index) => {
      const theaterStart = addMinutes(startTime, 15 * index);
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
  const currentDate = new Date();
  console.log("CURRENT DATE:", currentDate.toString());
  currentDate.setHours(10, 30, 0, 0);
  console.log("MODIFIED CURRENT DATE:", currentDate.toString());
  const showDate = new Date(
    new Date(
      currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7)
    ).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
  console.log("SHOW DATE:", showDate.toString());

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
          time: showtime,
          maxSeats: 64,
          availableSeats: 64,
          theaterId,
          movieId:
            movieData[getMovieIndex(theaterId, index % 2 == 0)]?.movieId || 0,
        }));
      })
      .flat(),
  });

  // Trigger redeploy
  if (process.env.RESET_LINK !== null && process.env.RESET_LINK !== undefined) {
    void fetch(`${process.env.RESET_LINK}`);
  }

  console.log("Theater Reset.");
}

if (!process.env.VERCEL_URL) {
  void reset();
}
