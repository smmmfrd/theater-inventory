import { PrismaClient, Movie, Theater } from "@prisma/client";
require("dotenv").config();

const prisma = new PrismaClient();

type TopMovies = [Movie, Movie, Movie, Movie, Movie, Movie, Movie, Movie];

type Theaters = [
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater
];

async function getMovies() {
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.MOVIE_DB_API_KEY}&page=1`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  const res = await fetch(url, options);
  const json = await res.json();
  const movies: TopMovies = json.results
    .filter((_: any, i: number) => i < 8)
    .map((movie: any, index: number): Movie => {
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
  currentDate.setHours(10, 30, 0, 0);
  const showDate = new Date(
    currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7)
  );

  // Create the starting data
  const movieData = await getMovies();
  const theaterData = MakeTheaters(showDate);

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
          movieId: movieData[getMovieIndex(theaterId, index % 2 == 0)].movieId,
        }));
      })
      .flat(),
  });

  // Trigger redeploy
  if (process.env.VERCEL_URL) {
    fetch(`${process.env.RESET_LINK}`);
  }

  console.log("Theater Reset.");
}

if (!process.env.VERCEL_URL) {
  reset();
}
